import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import { getCustomPluginData, PluginContext } from './LoginScreen/Config/PluginData';
import { checkDeviceStatus, authorizeContent, getAuthZToken } from './LoginPluginInterface';
import session from './LoginScreen/Config/Session';
import LoadingScreen from './LoginScreen/Screens/LoadingScreen';
import ErrorScreen from './LoginScreen/Screens/ErrorScreen';
import SignInScreen from './LoginScreen/Screens/SignInScreen';
import LogoutScreen from './LoginScreen/Screens/LogoutScreen';
import {
  isHomeScreen,
  getFromSessionStorage,
  isPlayerHook,
  hideMenu,
  setToLocalStorage,
  isHook
} from './LoginScreen/Utils';
import trackEvent from './Analytics';
import EVENTS from './Analytics/Events';
import { HEARBEAT } from './Adobe/Config';


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
  let heartbeat;

  const pluginData = getCustomPluginData(screenData);

  session.isHomeScreen = isHomeScreen(navigator);

  useEffect(() => {
    hideMenu(navigator);
    start();
    return () => clearInterval(heartbeat);
  }, []);

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

  const errorCallback = (err) => setError(err);

  const start = async () => {
    try {
      const requiresAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);
      if (isPlayerHook(payload) && !requiresAuth) return successLoginFlow();

      return startAuthNFlow();
    } catch (err) {
      return startAuthNFlow();
    }
  };

  const startLogoutFlow = () => {
    setError(null);
    setScreen('LOGOUT');
  };

  const startAuthZFlow = async (deviceId) => {
    if (isPlayerHook(payload)) {
      trackEvent(EVENTS.authZ.authorizationActivated, { payload, credentials });
      const resource = await authorizeContent(deviceId, credentials, payload);
      const token = await getAuthZToken(deviceId, credentials, resource);

      await setToLocalStorage('idToken', token);
      trackEvent(EVENTS.authZ.authorizationSuccess, { payload, credentials });
    }
  };

  const startAuthNFlow = async () => {
    try {
      setError(null);
      const deviceId = await getFromSessionStorage('uuid');
      const userId = await checkDeviceStatus(deviceId, credentials);

      if (userId && !isHook(navigator)) return startLogoutFlow();
      if (userId && !isPlayerHook(payload)) return successLoginFlow();
      if (!userId) setScreen('LOGIN');

      heartbeat = setInterval(() => {
        getSignInStatus(deviceId);
      }, HEARBEAT);
    } catch (err) {
      trackEvent(EVENTS.authZ.authorizationFailed, { payload, credentials, error: err });
      setError(err);
    }
  };

  const getSignInStatus = async (deviceId) => {
    try {
      const userId = await checkDeviceStatus(deviceId, credentials);
      if (userId) {
        clearInterval(heartbeat);
        trackEvent(
          EVENTS.authN.activationSuccess,
          { credentials, payload, deviceId }
        );
        await setToLocalStorage('idToken', userId);
        await setToLocalStorage('userId', userId);

        await startAuthZFlow(deviceId);
        return callback ? successLoginFlow() : navigator.goBack();
      }
    } catch (err) {
      console.log(err);
      trackEvent(
        EVENTS.authN.activationFailed,
        {
          credentials,
          payload,
          error,
          deviceId
        }
      );
      setError(err);
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
        startAuthZFlow={startAuthZFlow}
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
        skipLoginflow={skipLoginflow}
        startAuthFlow={startAuthNFlow}
        startLogoutFlow={startLogoutFlow}
      />
    </PluginContext.Provider>
  );

  const renderScreen = (targetScreen) => {
    const screens = {
      LOGIN: renderLoginScreen,
      LOGOUT: renderLogoutScreen,
      LOADING: renderLoadingScreen
    };

    return screens[targetScreen]();
  };

  return error ? renderErrorScreen() : renderScreen(screen);
}

export default storeConnector(AdobeLoginComponent);
