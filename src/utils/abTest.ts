/**
 * Lightweight A/B testing utility for Swarms.Guide.
 * Buckets users 50/50 into 'Variant A' or 'Variant B' and persists selection.
 */

export type ABVariant = 'A' | 'B';

const STORAGE_KEY = 'swarms_guide_ab_variant';

/**
 * Gets the current A/B variant for the user.
 * Generates and persists a new one if not found.
 */
export const getABVariant = (): ABVariant => {
  if (typeof window === 'undefined') return 'A';

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'A' || stored === 'B') {
    return stored as ABVariant;
  }

  // 50/50 assignment
  const newVariant: ABVariant = Math.random() < 0.5 ? 'A' : 'B';
  localStorage.setItem(STORAGE_KEY, newVariant);
  return newVariant;
};

/**
 * Copy constants for each variant
 */
export const AB_COPY = {
  A: {
    headline: "Swarms.Guide",
    cta: "Explore Swarms",
    subheadline: "Your step-by-step hub for autonomous AI agent swarms."
  },
  B: {
    headline: "Build Your 24/7 Virtual Workforce",
    cta: "Launch Your First Swarm",
    subheadline: "Transition from simple chatting to fully autonomous multi-agent systems."
  }
};
