import { withNavigator } from '@applicaster/zapp-react-native-ui-components/Decorators/Navigator/';
import AdobeComponent from './src/ReactNative/AdobeComponent';


const AdobePlugin = {
  Component: withNavigator(AdobeComponent),
  isFlowBlocker: () => true,
  presentFullScreen: true,
  showNavBar: true,
  hasPlayerHook: true
};

export default AdobePlugin;
