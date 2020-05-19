import { withNavigator } from '@applicaster/zapp-react-native-ui-components/Decorators/Navigator';
import AdobeLoginComponent from './src';


const AdobeLoginPlugin = {
  Component: withNavigator(AdobeLoginComponent),
  isFlowBlocker: () => true,
  presentFullScreen: true,
  hasPlayerHook: true
};

export default AdobeLoginPlugin;
