import { withNavigator } from '@applicaster/zapp-react-native-ui-components/Decorators/Navigator/';
import ParentLock from './src/ParentLock';


const ParentLockPlugin = {
    Component: withNavigator(ParentLock),
    isFlowBlocker: () => true,
    presentFullScreen: true,
};

export default ParentLockPlugin;
