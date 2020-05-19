import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { sessionStorage } from '@applicaster/zapp-react-native-bridge/ZappStorage/SessionStorage';
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import { getCustomPluginData, PluginContext } from './LoginScreen/Config/PluginData';
import { isHomeScreen, isTokenInStorage, isPlayerHook } from './LoginScreen/Utils';
import session from './LoginScreen/Config/Session';
import SCREENS from './LoginScreen/Config/Screens';
import LoadingScreen from './LoginScreen/Screens/LoadingScreen';
import ErrorScreen from './LoginScreen/Screens/ErrorScreen';
import SignInScreen from './LoginScreen/Screens/SignInScreen';
import LogoutScreen from './LoginScreen/Screens/LogoutScreen';


const storeConnector = connectToStore((state) => {
  const values = Object.values(state.rivers);
  const screenData = values.find(({ type }) => type === 'quick-brick-adobe-primetime-tv');
  const homeScreen = values.find(({ home }) => home === true);
  return { screenData, homeScreen };
});


function AdobeLoginComponent(props) {
  const {
    callback,
    screenData,
    payload,
    navigator,
    homeScreen,
    parentFocus,
    focused
  } = props;

  const [screen, setScreen] = useState(SCREENS.LOADING);
  const pluginData = getCustomPluginData(screenData);

  session.isHomeScreen = isHomeScreen(navigator);

  useEffect(() => {
    hideMenu();
    start();
  }, []);

  const hideMenu = () => {
    if (navigator.isNavBarVisible) {
      navigator.hideNavBar();
      session.navBarHidden = true;
    }
  };

  const goToScreen = (targetScreen) => {
    setScreen(targetScreen);
  };

  const successLoginFlow = () => {
    callback({
      success: true,
      payload
    });
  };

  const skipLoginflow = () => {
    callback({
      success: false,
      payload
    });
  };

  const tryToSkipPlayerHookFlow = () => {
    const requiresAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);
    return (!requiresAuth) ? successLoginFlow() : goToScreen(SCREENS.LOGIN);
  };

  const isHook = () => {
    // need to check if it's a hook.
    // If it was ui_component && token in localstorage => logout screen;
    return !!R.propOr(false, 'hookPlugin')(navigator.routeData());
  };

  const start = async () => {
    try {
      const isToken = await isTokenInStorage('idToken');
      const deviceId = await sessionStorage.getItem('uuid');

      if (isToken) {
        return isHook() ? successLoginFlow() : goToScreen('LOGOUT');
      }

      return startLoginFlow();
    } catch (err) {
      startLoginFlow();
    }
  };

  const startLoginFlow = () => {
    if (isPlayerHook(payload)) return tryToSkipPlayerHookFlow();

    return goToScreen(SCREENS.LOGIN);
  };

  const remoteHandler = async (component, event) => {
    const { eventType } = event;
    if (eventType === 'menu' && session.isHomeScreen) {
      return null;
    }
    if (eventType === 'menu' && navigator.canGoBack()) {
      navigator.goBack();
      return skipLoginflow();
    }
    if (eventType === 'menu' && !session.isHomeScreen) {
      successLoginFlow();
      return navigator.replace(homeScreen);
    }
  };

  const renderLoadingScreen = () => <LoadingScreen />;

  const renderLoginScreen = () => (
    <PluginContext.Provider value={pluginData}>
      <SignInScreen
        navigator={navigator}
        closeHook={callback}
        screenData={screenData}
        payload={payload}
        remoteHandler={remoteHandler}
      />
    </PluginContext.Provider>
  );

  const renderLogoutScreen = () => (
    <PluginContext.Provider value={pluginData}>
      <LogoutScreen
        homeScreen={homeScreen}
        navigator={navigator}
        screenData={screenData}
        remoteHandler={remoteHandler}
        parentFocus
        focused
      />
    </PluginContext.Provider>
  );

  const renderErrorScreen = () => (
    <PluginContext.Provider value={pluginData}>
      <ErrorScreen
        homeScreen={homeScreen}
        navigator={navigator}
        screenData={screenData}
        remoteHandler={remoteHandler}
        parentFocus
        focused
      />
    </PluginContext.Provider>
  );

  const renderScreen = (targetScreen) => {
    const screens = {
      [SCREENS.LOGIN]: renderLoginScreen,
      [SCREENS.LOGOUT]: renderLogoutScreen,
      [SCREENS.LOADING]: renderLoadingScreen,
      [SCREENS.ERROR]: renderErrorScreen
    };

    return screens[targetScreen]();
  };

  return (
    renderScreen(screen)
  );
}

export default storeConnector(AdobeLoginComponent);
