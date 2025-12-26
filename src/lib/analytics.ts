// Analytics utility
// TODO: Replace console.log with actual analytics provider (e.g., Mixpanel, Amplitude, PostHog)

type AnalyticsEvent =
  | "generate_started"
  | "generate_success"
  | "generate_error"
  | "tip_modal_open"
  | "tip_checkout_click"
  | "download_click"
  | "style_selected"
  | "prompt_copied"
  | "page_view";

interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(event: AnalyticsEvent, properties?: EventProperties): void {
  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, properties || {});
  }

  // TODO: Send to analytics provider
  // Example with PostHog:
  // posthog.capture(event, properties);
  
  // Example with Mixpanel:
  // mixpanel.track(event, properties);
}

export function trackPageView(page: string): void {
  trackEvent("page_view", { page });
}

export function identifyUser(userId: string, traits?: EventProperties): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] Identify user: ${userId}`, traits || {});
  }

  // TODO: Identify user with analytics provider
  // posthog.identify(userId, traits);
}

