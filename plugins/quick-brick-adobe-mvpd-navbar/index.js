// @flow
import * as React from "react";
import { useState, useEffect }from "react";
import * as R from "ramda";
import {
    TouchableHighlight,
    Image,
    StyleSheet,
    Dimensions,
    Platform,
    Linking
} from "react-native";

import { useNavigation } from "@applicaster/zapp-react-native-utils/reactHooks/navigation";
import { connectToStore } from "@applicaster/zapp-react-native-redux";
import { getFromLocalStorage, isItemInStorage } from "./src/Utils";

const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;
const isMobile = !Platform.isTV;
const isPad = isMobile && aspectRatio < 1.6;

const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
    const values = Object.values(state.pluginConfigurations);
    const plugin = values.find(
        ({ plugin }) => plugin.identifier === 'adobe_mvpd_navbar_icon'
    );
    const pluginConfig = plugin.configuration_json;
    return { pluginConfig };
});

function AdobeMvpdButtonComponent(props) {

    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [actionLink, setActionLink] = useState(null);
    const [providerLogo, setProviderLogo] = useState(null);
    const navigator = useNavigation();
    const { target } = props.navItem.data;
    const {
        icon_width: iconWidth,
        icon_right_margin: iconRightMargin
    } = props.pluginConfig;


    useEffect(() => {
        start();
    }, [navigator.previousAction]);

    const start = async () => {
        const token = await isItemInStorage('idToken');
        await fectchProviderData();
        token ? setIsLoggedIn(true) : setIsLoggedIn(false);
    };

    const fectchProviderData = async () => {
        const isAuthProviderExist = await isItemInStorage('authProviderID');
        if (isAuthProviderExist) {
            const authProviderItem = await getFromLocalStorage('authProviderID');
            fetchProviderLogo(authProviderItem);
            fetchActionLink(authProviderItem);
        }
    }

    function fetchActionLink(authProviderItem) {
        const {
            action_links:  {
                iOS: iosLink,
                Android: androidLink
            }
        } = authProviderItem;

        switch (Platform.OS) {
            case 'ios':
                iosLink && setActionLink(iosLink);
                break;
            case 'android':
                androidLink && setActionLink(androidLink);
                break;
        }
    }

    function fetchProviderLogo(authProviderItem) {
        const {
            mobile_screen_logo: authProviderMobileLogo,
            tablet_screen_logo: authProviderTabletLogo,
            tv_screen_logo: authProviderTVLogo,
        } = authProviderItem;

        if (!isMobile && authProviderTVLogo) {
            setProviderLogo(authProviderTVLogo);
            return;
        }
        if (isPad && authProviderTabletLogo) {
            setProviderLogo(authProviderTabletLogo);
            return;
        }
        if (!isPad && authProviderMobileLogo) {
            setProviderLogo(authProviderMobileLogo);
            return;
        }
    }

    async function openWebLink(url) {
        const supported = await Linking.canOpenURL(url);

        if (supported) {
            await Linking.openURL(url);
        }
    }

    function pushScreen(riverId) {
        closeMenu();
        if (riverId) {
            const targetRiver = R.values(rivers).find(
                (river) => river.id === riverId
            );
            navigator.push(targetRiver);
        }
    }

    function imageStyle() {
        const width = iconWidth ? Number(iconWidth) : 44;
        return {
            width: width,
            height: 44,
            resizeMode: 'contain'
        };
    }

    function renderNavButton() {
        return (
            <TouchableHighlight
                onPress={() => actionLink ? openWebLink(actionLink) : pushScreen(target)}
                accessible
                testID={props.navItem.id}
                accessibilityLabel={props.navItem.id}
                style={{marginRight: iconRightMargin ? Number(iconRightMargin) : 10}}
            >
                <Image source={{ uri: providerLogo }} style={imageStyle()} />
            </TouchableHighlight>
        );
    }

    return isLoggedIn ? renderNavButton() : null;
}

export default storeConnector(AdobeMvpdButtonComponent);
