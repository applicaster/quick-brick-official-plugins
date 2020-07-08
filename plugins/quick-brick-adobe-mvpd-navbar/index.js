// @flow
import * as React from "react";
import * as R from "ramda";
import {
    TouchableHighlight,
    Image,
    StyleSheet,
    Dimensions,
    Platform
} from "react-native";

import { useNavigation } from "@applicaster/zapp-react-native-utils/reactHooks/navigation";
import { connectToStore } from "@applicaster/zapp-react-native-redux";

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
                                    closeMenu,
                                }: Props) {
    const [actionLink, setActionLink] = useState(null);
    const [providerLogo, setProviderLogo] = useState(null);
    const navigator = useNavigation();
    const { target } = navItem.data;

    useEffect(() => {
        fectchProviderData();
    }, []);

    const fectchProviderData = async () => {
        const authProviderItem = await getFromLocalStorage("authProviderID");
        if (!authProviderItem) {
            return null;
        }
        fetchProviderLogo(authProviderItem);
        fetchActionLink(authProviderItem);
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

    function openWebLink(link) {

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
                <Image source={{ uri: icon }} style={css.mvpd_icon} />
            </TouchableHighlight>
        );
    }

    return providerLogo ? renderNavButton() : null;
}

export const AdobeMvpdButton = connectToStore(
    R.pick(["rivers", "plugins", "localizations"])
)(AdobeMvpdButtonComponent);
