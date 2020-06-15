import { InterstitialAd, AdEventType } from '@react-native-firebase/admob';
import React, { useEffect } from 'react';
import session from './Configuration/Session';
import trackEvent from './Analytics';


function Interstitial({ callback, payload }) {
  const targetScreenId = payload?.id;

  const {
    advertising: {
      display_interstitial_once: displayOnce = true,
      interstitial_ad_unit_id: adUnitId = ''
    } = {}
  } = payload;

  const closeHook = () => callback({ success: true, payload });

  const interstitial = InterstitialAd.createForAdRequest(adUnitId);

  const unsubscribe = interstitial.onAdEvent((type, error) => {
    const {
      LOADED,
      CLOSED,
      ERROR
    } = AdEventType;

    switch (type) {
      case LOADED:
        interstitial.show();
        session.displayedAds.push(targetScreenId);
        break;
      case CLOSED:
        closeHook();
        break;
      case ERROR:
        trackEvent(error.code, adUnitId);
        closeHook();
    }
  });

  const loadInterstitials = () => {
    // check if this ad was loaded before && displayOnce = true => close hook
    try {
      if (session.displayedAds.includes(targetScreenId) && displayOnce) {
        return closeHook();
      }
      interstitial.load();
    } catch (err) {
      console.log(err);
      closeHook();
    }
  };

  useEffect(() => {
    loadInterstitials();
    return () => unsubscribe();
  }, []);

  if (!interstitial.loaded) return null;
}

export default Interstitial;
