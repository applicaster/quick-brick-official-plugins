import { withNavigator } from '@applicaster/zapp-react-native-ui-components/Decorators/Navigator/';
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import Interstitial from './src/Interstitial';
import InlineBanner from './src/InlineBanner';

const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
  const values = Object.values(state.rivers);
  const screenData = values.find(
    ({ type }) => type === 'google-admob-interstitials-qb'
  );
  return { screenData };
});

function AdMobPlugin(props) {
  console.log(props);

  const {
    onLoadFinished,
    screenData
  } = props;

  return onLoadFinished ? InlineBanner(props) : Interstitial(screenData);
}

export default storeConnector(AdMobPlugin);
