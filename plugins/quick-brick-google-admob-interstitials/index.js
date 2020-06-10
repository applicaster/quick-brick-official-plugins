import { connectToStore } from '@applicaster/zapp-react-native-redux';
import Interstitial from './src/Interstitial';


const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
  const values = Object.values(state.rivers);

  const hasAdmobPrehookReducer = (accumulator, item) => {
    // eslint-disable-next-line camelcase
    const preloadPlugins = item?.hooks?.preload_plugins;
    const isNotEmptyArray = Array.isArray(preloadPlugins) && preloadPlugins.length > 0;
    if (!isNotEmptyArray) return accumulator;

    const hasAdmobPrehook = preloadPlugins.some(({ identifier }) => identifier === 'google-admob-ads-qb');
    if (hasAdmobPrehook) {
      accumulator[item.id] = item?.advertising;
    }
    return accumulator;
  };

  const advertisingData = values.reduce(hasAdmobPrehookReducer, {});
  return { advertisingData };
});


const InterstitialAd = {
  Component: storeConnector(Interstitial),
  isFlowBlocker: () => true,
  presentFullScreen: true
};

export default InterstitialAd;
