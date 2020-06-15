import Interstitial from './src/Interstitial';


const InterstitialAd = {
  Component: Interstitial,
  isFlowBlocker: () => true,
  presentFullScreen: true
};

export default InterstitialAd;
