import * as R from 'ramda';
import { localStorage as storage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';
import { parseJsonIfNeeded } from '@applicaster/zapp-react-native-utils/functionUtils';
import { fontsize, fontcolor } from '../Config/DefaultStyles';


function getPluginData(screenData) {
  let pluginData = {};

  if (screenData && screenData.general) {
    pluginData = { ...pluginData, ...screenData.general };
    validateStyles(pluginData);
  }

  return pluginData;
}

async function setToLocalStorage(key, value, namespace) {
  return storage.setItem(key, value, namespace);
}

async function getFromLocalStorage(key, namespace) {
  return storage.getItem(key, namespace);
}

async function removeFromLocalStorage(key, namespace) {
  return storage.setItem(key, JSON.stringify({}), namespace);
}

async function isTokenInStorage(key, namespace) {
  try {
    let token = await getFromLocalStorage(key, namespace);

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
  pluginData[key] = Number.isFinite(num) ? num : fontsize[keyname];
};

const validateFontcolor = (key, pluginData) => {
  const value = pluginData[key];

  pluginData[key] = (value !== undefined && value !== null) ? value : fontcolor.default;
};

const isHomeScreen = (navigator) => {
  return R.pathOr(false, ['payload', 'home'], navigator.routeData());
};

const isPlayerHook = (payload) => R.pathSatisfies(
  (value) => value === 'video',
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

export {
  getPluginData,
  setToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  isTokenInStorage,
  isHomeScreen,
  isPlayerHook,
  parseFontKey
};
