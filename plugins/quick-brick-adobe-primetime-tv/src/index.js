import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import { getCustomPluginData, PluginContext } from './LoginScreen/Config/PluginData';
import { checkDeviceStatus } from './LoginPluginInterface';
import session from './LoginScreen/Config/Session';
import LoadingScreen from './LoginScreen/Screens/LoadingScreen';
import ErrorScreen from './LoginScreen/Screens/ErrorScreen';
import SignInScreen from './LoginScreen/Screens/SignInScreen';
import LogoutScreen from './LoginScreen/Screens/LogoutScreen';
import {
  isHomeScreen,
  isTokenInStorage,
  getFromSessionStorage,
  isPlayerHook,
  hideMenu
} from './LoginScreen/Utils';


const storeConnector = connectToStore((state) => {
  const values = Object.values(state.rivers);
  const screenData = values.find(({ type }) => type === 'adobe-primetime-tv-qb');
  const homeScreen = values.find(({ home }) => home === true);
  return { screenData, homeScreen };
});


function AdobeLoginComponent(props) {
  const {
    callback,
    screenData,
    payload,
    navigator,
    homeScreen
  } = props;

  const {
    general: {
      base_url: baseUrl = '',
      resource_id: resourceId = '',
      requestor_id: requestorId = '',
      private_key: privateKey = '',
      public_key: publicKey = ''
    } = {}
  } = screenData || {};

  const credentials = {
    baseUrl,
    resourceId,
    requestorId,
    privateKey,
    publicKey
  };

  const [screen, setScreen] = useState('LOADING');
  const [error, setError] = useState(null);
  const pluginData = getCustomPluginData(screenData);

  session.isHomeScreen = isHomeScreen(navigator);

  useEffect(() => {
    hideMenu(navigator);
    start();
  }, []);

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

  const isHook = () => {
    // need to check if it's a hook.
    // If it was ui_component && token in localstorage => logout screen;
    return !!R.propOr(false, 'hookPlugin')(navigator.routeData());
  };

  const errorCallback = (err) => {
    setError(err);
    goToScreen('ERROR');
  };

  const start = async () => {
    try {
      const isToken = await isTokenInStorage('idToken');

      const requiresAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);
      if (isPlayerHook(payload) && !requiresAuth) return successLoginFlow();
      if (isToken && !isHook()) return goToScreen('LOGOUT');

      return checkAuth();
    } catch (err) {
      return checkAuth();
    }
  };

  const checkAuth = async () => {
    try {
      const deviceId = await getFromSessionStorage('uuid');
      const userId = await checkDeviceStatus(deviceId, credentials);
      if (!userId) return goToScreen('LOGIN');
      return callback({ success: true, payload });
    } catch (err) {
      setError(err);
      return goToScreen('ERROR');
    }
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
        errorCallback={errorCallback}
        credentials={credentials}
        payload={payload}
        remoteHandler={remoteHandler}
      />
    </PluginContext.Provider>
  );

  const renderLogoutScreen = () => (
    <PluginContext.Provider value={pluginData}>
      <LogoutScreen
        navigator={navigator}
        credentials={credentials}
        errorCallback={errorCallback}
        remoteHandler={remoteHandler}
      />
    </PluginContext.Provider>
  );

  const renderErrorScreen = () => (
    <PluginContext.Provider value={pluginData}>
      <ErrorScreen
        error={error}
        navigator={navigator}
        remoteHandler={remoteHandler}
        closeHook={callback}
        goToScreen={goToScreen}
      />
    </PluginContext.Provider>
  );

  const renderScreen = (targetScreen) => {
    const screens = {
      LOGIN: renderLoginScreen,
      LOGOUT: renderLogoutScreen,
      LOADING: renderLoadingScreen,
      ERROR: renderErrorScreen
    };

    return screens[targetScreen]();
  };

  return (
    renderScreen(screen)
  );
}

export default storeConnector(AdobeLoginComponent);
