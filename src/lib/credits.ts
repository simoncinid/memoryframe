import { authenticatedFetch } from './auth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export interface FreeQuota {
  remaining: number;
  total: number;
  hasQuota: boolean;
}

export interface Transaction {
  id: string;
  kind: 'grant' | 'spend' | 'refund';
  photoDelta: number;
  reason: string;
  stripeEventId: string | null;
  jobId: string | null;
  createdAt: string;
}

export interface Pricing {
  photoPacks: Array<{
    id: string;
    name: string;
    credits: number;
    price: number;
    priceId: string | null;
  }>;
  pricePerCredit: number;
}

export interface CheckoutResponse {
  url: string;
  sessionId: string;
  totalAmount: number;
  photoCredits: number;
}

export async function getFreeQuota(): Promise<FreeQuota> {
  const response = await fetch(`${BACKEND_URL}/v1/free-quota`);
  if (!response.ok) {
    throw new Error('Error retrieving quota');
  }
  return response.json();
}

export async function getTransactions(limit = 50, offset = 0): Promise<{
  transactions: Transaction[];
  limit: number;
  offset: number;
}> {
  const response = await authenticatedFetch(
    `${BACKEND_URL}/v1/transactions?limit=${limit}&offset=${offset}`
  );
  if (!response.ok) {
    throw new Error('Error retrieving transactions');
  }
  return response.json();
}

export async function getPricing(): Promise<Pricing> {
  const response = await fetch(`${BACKEND_URL}/v1/pricing`);
  if (!response.ok) {
    throw new Error('Error retrieving pricing');
  }
  return response.json();
}

export async function createCheckout(photoCredits: number): Promise<CheckoutResponse> {
  const response = await authenticatedFetch(`${BACKEND_URL}/v1/stripe/create-dynamic-checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photo_credits: photoCredits }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error creating checkout');
  }

  return response.json();
}
