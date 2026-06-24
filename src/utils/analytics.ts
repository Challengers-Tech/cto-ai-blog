/**
 * Lightweight mock analytics dispatcher for Swarms.Guide.
 * Sends events to /api/analytics handled by the local dev server.
 */

export interface AnalyticsEvent {
  event: string;
  variant?: string;
  path?: string;
  properties?: Record<string, any>;
}

/**
 * Tracks an event by sending it to the mock backend.
 * Automatically excludes active owner sessions when 'exclude_analytics' is set.
 */
export const trackEvent = async (name: string, properties: Record<string, any> = {}) => {
  // Check if owner has opted to exclude their actions from statistics
  if (typeof window !== 'undefined' && localStorage.getItem('exclude_analytics') === 'true') {
    console.log(`[Analytics] [EXCLUDED] Bypassed event tracking for owner: ${name}`, properties);
    return;
  }

  const eventData: AnalyticsEvent = {
    event: name,
    path: typeof window !== 'undefined' ? window.location.pathname : '',
    properties
  };

  // Log to console for debugging
  console.log(`[Analytics] Tracking: ${name}`, properties);

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    });

    if (!response.ok) {
      console.warn('[Analytics] Failed to send event to server');
    }
  } catch (error) {
    console.error('[Analytics] Error sending event:', error);
  }
};
