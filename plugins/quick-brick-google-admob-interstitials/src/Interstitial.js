import React, { useEffect } from 'react';
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';


function Interstitial() {
  const adUnitId = TestIds.INTERSTITIAL;

  const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['fashion', 'clothing'],
  });

  useEffect(() => {
    interstitial.show();
  }, []);

  return null;
}

export default Interstitial;
