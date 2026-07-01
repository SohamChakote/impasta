import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Automatically uses Google's safe Test ID during dev to prevent you getting banned.
// Uses your real ID from the .env file when you build the final app.
const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : process.env.EXPO_PUBLIC_INTERSTITIAL_AD_ID || '';

let interstitial: InterstitialAd | null = null;
let isLoaded = false;

export const AdManager = {
    /**
     * 1. Initializes and pre-loads the very first ad.
     * Call this in your App.tsx or index.tsx when the app starts.
     */
    initialize: () => {
        if (interstitial) return; // Prevent double initialization

        interstitial = InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true, // Safer for global privacy laws
        });

        interstitial.addAdEventListener(AdEventType.LOADED, () => {
            isLoaded = true;
            console.log('Ad successfully pre-loaded and ready!');
        });

        interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            isLoaded = false;
            // The moment the user closes the ad, immediately fetch the next one
            AdManager.preloadAd();
        });

        // Fetch the first ad
        AdManager.preloadAd();
    },

    /**
     * 2. Pre-loads the ad in the background.
     */
    preloadAd: () => {
        if (interstitial && !isLoaded) {
            interstitial.load();
        }
    },

    /**
     * 3. The UX Logic: 60% chance to show an ad.
     */
    shouldShowAd: () => {
        return Math.random() < 0.60;
    },

    /**
     * 4. The trigger function. We will wire this to the Reveal Screen later.
     * It takes a "callback" function to execute AFTER the ad finishes (like navigating).
     */
    showAdIfReady: (onComplete: () => void) => {
        if (isLoaded && interstitial && AdManager.shouldShowAd()) {
            // Create a one-time listener for when THIS specific ad closes
            const unsubscribe = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                unsubscribe(); // Clean up the listener
                onComplete();  // Move the player to the next screen
            });

            // Show the ad
            interstitial.show();
        } else {
            // If the ad isn't loaded yet, OR if the 60% coin flip landed on 'skip',
            // skip the ad and instantly move the player.
            onComplete();
        }
    }
};