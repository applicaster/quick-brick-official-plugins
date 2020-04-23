import { withNavigator } from '@applicaster/zapp-react-native-ui-components/Decorators/Navigator/';
import AdInterstitialsComponent from './src/AdInterstitialsComponent';

const AdInterstitialsPlugin = {
    Component: withNavigator(AdInterstitialsComponent),
    isFlowBlocker: () => true,
    presentFullScreen: true,
    hasPlayerHook: true
};

export default AdInterstitialsPlugin;
