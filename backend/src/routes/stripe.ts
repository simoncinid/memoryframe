import type { FastifyPluginAsync } from 'fastify';
import Stripe from 'stripe';
import { getDatabasePool } from '../lib/database.js';
import { config } from '../lib/config.js';
import { grantCreditsMemoryFrame, getUserById } from '../lib/credits.js';
import { verifyAccessToken } from '../lib/auth.js';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2025-02-24.acacia',
});

const stripeRoutes: FastifyPluginAsync = async (fastify) => {
  const db = getDatabasePool();

  // Create checkout session for dynamic credit purchase
  fastify.post('/v1/stripe/create-dynamic-checkout', async (request, reply) => {
    try {
      // Verify authentication
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({
          error: 'UNAUTHORIZED',
          message: 'Authentication required',
        });
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);

      if (!payload || !payload.userId) {
        return reply.status(401).send({
          error: 'INVALID_TOKEN',
          message: 'Token invalid',
        });
      }

      const { photo_credits } = request.body as { photo_credits?: number };

      if (!photo_credits || photo_credits <= 0 || !Number.isInteger(photo_credits)) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'photo_credits must be a positive integer',
        });
      }

      // Minimum 4 credits (to ensure at least $0.50)
      if (photo_credits < 4) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Minimum is 4 credits ($0.76)',
        });
      }

      // Calculate total
      const unitAmount = config.pricePerPhotoCredit; // in cents
      const totalAmount = photo_credits * unitAmount;

      // Verify Stripe minimum ($0.50 = 50 cents)
      if (totalAmount < 50) {
        return reply.status(400).send({
          error: 'VALIDATION_ERROR',
          message: 'Importo minimo è $0.50',
        });
      }

      // Load user
      const user = await getUserById(db, payload.userId);
      if (!user) {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'User not found',
        });
      }

      // Create or update Stripe Customer
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            user_id: user.id,
          },
        });
        customerId = customer.id;

        // Save customer ID
        await db.query(
          `UPDATE users_memory_frame SET stripe_customer_id = $1 WHERE id = $2`,
          [customerId, user.id]
        );
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Photo Credits',
                description: `${photo_credits} credits to generate images`,
              },
              unit_amount: unitAmount,
            },
            quantity: photo_credits,
          },
        ],
        metadata: {
          type: 'dynamic_credits',
          photo_credits: photo_credits.toString(),
          user_id: user.id,
        },
        success_url: `${config.frontendOrigin}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.frontendOrigin}/purchase-cancel`,
      });

      return reply.status(200).send({
        url: session.url,
        sessionId: session.id,
        totalAmount: totalAmount / 100, // in dollars
        photoCredits: photo_credits,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        error: 'INTERNAL_ERROR',
        message: 'Error creating checkout',
      });
    }
  });

  // Webhook Stripe
  fastify.post('/v1/stripe/webhook', async (request, reply) => {
    const sig = request.headers['stripe-signature'];

    if (!sig) {
      return reply.status(400).send({
        error: 'MISSING_SIGNATURE',
        message: 'Stripe signature missing',
      });
    }

    let event: Stripe.Event;

    try {
      const rawBody = (request as any).rawBody as Buffer;
      if (!rawBody) {
        return reply.status(400).send({
          error: 'MISSING_BODY',
          message: 'Request body missing',
        });
      }

      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        config.stripeWebhookSecret
      );
    } catch (err) {
      request.log.error({ err }, 'Webhook signature verification failed');
      return reply.status(400).send({
        error: 'INVALID_SIGNATURE',
        message: 'Webhook signature invalid',
      });
    }

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      try {
        // Check for duplicates
        const existingResult = await db.query(
          `SELECT id FROM credit_transactions_memory_frame 
           WHERE stripe_event_id = $1`,
          [event.id]
        );

        if (existingResult.rows.length > 0) {
          request.log.info(`Webhook already processed: ${event.id}`);
          return reply.status(200).send({ status: 'ok', message: 'Already processed' });
        }

        const metadata = session.metadata;

        if (metadata?.type === 'dynamic_credits') {
          const photoCredits = parseInt(metadata.photo_credits || '0', 10);
          const userId = metadata.user_id;

          if (!userId || photoCredits <= 0) {
            request.log.error({ metadata }, 'Invalid metadata in webhook');
            return reply.status(400).send({
              error: 'INVALID_METADATA',
              message: 'Invalid metadata',
            });
          }

          // Load user
          const user = await getUserById(db, userId);
          if (!user) {
            request.log.error(`User not found: ${userId}`);
            return reply.status(404).send({
              error: 'USER_NOT_FOUND',
              message: 'User not found',
            });
          }

          // Update stripe_customer_id if available
          if (session.customer && typeof session.customer === 'string') {
            await db.query(
              `UPDATE users_memory_frame SET stripe_customer_id = $1 WHERE id = $2`,
              [session.customer, userId]
            );
          }

          // Assign credits
          const reason = `Stripe purchase: ${photoCredits} credits (Session: ${session.id})`;
          await grantCreditsMemoryFrame(
            db,
            userId,
            photoCredits,
            reason,
            event.id
          );

          request.log.info({
            userId,
            photoCredits,
            sessionId: session.id,
            eventId: event.id,
          }, 'Credits assigned via Stripe webhook');

          return reply.status(200).send({ status: 'ok' });
        } else {
          request.log.warn({ type: metadata?.type }, 'Unsupported webhook type');
          return reply.status(200).send({ status: 'ok', message: 'Unsupported type' });
        }
      } catch (error) {
        request.log.error({ error }, 'Error processing webhook');
        return reply.status(500).send({
          error: 'INTERNAL_ERROR',
          message: 'Error processing webhook',
        });
      }
    }

    // Other events are ignored but return ok
    return reply.status(200).send({ status: 'ok' });
  });

  // Pricing endpoint
  fastify.get('/v1/pricing', async (_request, reply) => {
    const pricePerCredit = config.pricePerPhotoCredit / 100; // in dollars

    return reply.status(200).send({
      photoPacks: [
        {
          id: '10',
          name: '10 Credits',
          credits: 10,
          price: pricePerCredit * 10,
          priceId: null, // Dynamic pricing
        },
        {
          id: '50',
          name: '50 Credits',
          credits: 50,
          price: pricePerCredit * 50,
          priceId: null,
        },
        {
          id: '100',
          name: '100 Credits',
          credits: 100,
          price: pricePerCredit * 100,
          priceId: null,
        },
      ],
      pricePerCredit,
    });
  });
};

export default stripeRoutes;
