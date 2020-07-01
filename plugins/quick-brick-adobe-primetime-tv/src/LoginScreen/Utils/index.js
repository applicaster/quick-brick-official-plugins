import * as R from 'ramda';
import { localStorage as storage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';
import { sessionStorage } from '@applicaster/zapp-react-native-bridge/ZappStorage/SessionStorage';
import { fontsize, fontcolor } from '../Config/DefaultStyles';
import session from '../Config/Session';
import { parseJsonIfNeeded } from "@applicaster/zapp-react-native-utils/functionUtils";
import { uuidv4 } from '../../Adobe/Utils';


function getPluginData(screenData) {
  let pluginData = {};

  if (screenData && screenData.general) {
    pluginData = { ...pluginData, ...screenData.general };
    validateStyles(pluginData);
  }

  return pluginData;
}

async function getFromLocalStorage(key, namespace) {
  return storage.getItem(key, namespace);
}

async function isValueInStorage(key, namespace) {
  try {
    let token = await getFromLocalStorage(key, namespace);

    if (token === null) return false;

    if (typeof token === 'string') {
      token = parseJsonIfNeeded(token);
    }

    if (Array.isArray(token)) return !!token.length;
    if (typeof token === 'object') return !R.isEmpty(token);

    return !!token;
  } catch (err) {
    console.log(err);
    return false;
  }
}

async function setToLocalStorage(key, value, namespace) {
  return storage.setItem(key, value, namespace);
}

async function getFromSessionStorage(key, namespace) {
  return sessionStorage.getItem(key, namespace);
}

async function removeFromLocalStorage(key, namespace) {
  return storage.setItem(key, JSON.stringify({}), namespace);
}

function validateStyles(pluginData) {
  const keys = Object.keys(pluginData);
  keys.forEach((key) => {
    const type = key.split('_').pop();
    if (type === 'fontsize' || type === 'fontcolor') {
      validateKey(type, key, pluginData);
    }
  });
}

function validateKey(type, key, pluginData) {
  const keysValidation = {
    fontsize: validateFontsize,
    fontcolor: validateFontcolor
  };

  return keysValidation[type](key, pluginData);
}

const validateFontsize = (key, pluginData) => {
  const value = pluginData[key];
  const keyname = R.replace('_fontsize', '', key);

  const num = Number(value);
  pluginData[key] = Number.isFinite(num) && num > 0 ? num : fontsize[keyname];
};

const validateFontcolor = (key, pluginData) => {
  const value = pluginData[key];

  pluginData[key] = (value !== undefined && value !== null) ? value : fontcolor.default;
};

const isHomeScreen = (navigator, homeScreen) => {
  const targetId = R.pathOr('', ['payload', 'data', 'target'], navigator.routeData());
  const isHome = R.pathOr(false, ['payload', 'home'], navigator.routeData());
  return isHome || targetId === homeScreen.id;
};

const isPlayerHook = (payload) => R.pathSatisfies(
  (value) => value === 'video' || value === 'channel',
  ['type', 'value'],
  payload
);

const parseFontKey = (platform) => {
  const endpoints = {
    ios: 'tvos',
    android: 'android',
    samsung_tv: 'samsung'
  };
  return endpoints[platform];
};

const hideMenu = (navigator) => {
  navigator.hideNavBar();
  session.navBarHidden = true;
};

const showMenu = (navigator) => {
  if (session.navBarHidden) {
    navigator.showNavBar();
    session.navBarHidden = false;
  }
};

const isHook = (navigator) => {
  // need to check if it's a hook.
  // If it was ui_component && token in localstorage => logout screen;
  return !!R.propOr(false, 'hookPlugin')(navigator.routeData());
};

async function getDeviceId() {
  try {
    const isDeviceIdInStorage = await isValueInStorage('deviceId');

    if (isDeviceIdInStorage) return getFromLocalStorage('deviceId');

    const advertisingId = await getFromSessionStorage(
      'advertisingIdentifier', 'applicaster.v2'
    );

    const deviceId = advertisingId || uuidv4();
    await setToLocalStorage('deviceId', deviceId);

    return deviceId;
  } catch (err) {
    console.log(err);
  }
}

export {
  getPluginData,
  setToLocalStorage,
  getDeviceId,
  removeFromLocalStorage,
  isHomeScreen,
  isPlayerHook,
  parseFontKey,
  hideMenu,
  showMenu,
  isHook
};
