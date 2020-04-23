import {getCustomPluginData} from "@applicaster/quick-brick-adobe-primetime-auth/src/ReactNative/Config/PluginData";
import {hideMenu} from "@applicaster/quick-brick-adobe-primetime-auth/src/ReactNative/Utils";
import {connectToStore} from "@applicaster/zapp-react-native-redux";
import { InterstitialAd, TestIds } from '@react-native-firebase/admob';


const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
    const values = Object.values(state.rivers);
    const screenData = values.find(
        ({ type }) => type === 'google-admob-interstitials-qb'
    );
    return { screenData };
});

const adUnitId = TestIds.INTERSTITIAL

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
    keywords: ['fashion', 'clothing'],
});


class AdInterstitialsComponent extends Comment {
    pluginData = getCustomPluginData(this.props.screenData);

    constructor(props) {
        super(props);
        this.state = {
            dataSource: null
        };
    }

    componentDidMount() {
        const { screenData = {}, navigator } = this.props;
        hideMenu(navigator);
        interstitial.show();
    }

    componentWillUnmount() {

    }

}

export default storeConnector(AdInterstitialsComponent);
