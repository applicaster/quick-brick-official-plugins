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

type Props = {
    navItem: {
        id: string,
        data: {
            target: string,
        }
    },
    rivers: [],
    plugins: [],
    localizations: {},
    isMenuToggled: Number,
    closeMenu: () => void,
};

const css = StyleSheet.create({
    mvpd_icon: { width: 44, height: 44 },
});

const { height, width } = Dimensions.get('window');
const aspectRatio = height / width;
const isMobile = !Platform.isTV;
const isPad = isMobile && aspectRatio < 1.6;

function AdobeMvpdButtonComponent({
                                      navItem,
                                      rivers,
                                      closeMenu,
                                  }: Props) {

    const [isLoggedIn, setIsLoggedIn] = useState(null);
    const [actionLink, setActionLink] = useState(null);
    const [providerLogo, setProviderLogo] = useState(null);
    const navigator = useNavigation();
    const { target } = navItem.data;

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

    function renderNavButton() {
        return (
            <TouchableHighlight
                onPress={() => actionLink ? openWebLink(actionLink) : pushScreen(target)}
                accessible
                testID={navItem.id}
                accessibilityLabel={navItem.id}
            >
                <Image source={{ uri: providerLogo }} style={css.mvpd_icon} />
            </TouchableHighlight>
        );
    }

    return isLoggedIn ? renderNavButton() : null;
}

export default connectToStore(R.pick(["rivers"]))(AdobeMvpdButtonComponent);
