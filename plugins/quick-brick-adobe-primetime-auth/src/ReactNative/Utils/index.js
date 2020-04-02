import * as R from 'ramda';
import { localStorage as storage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';
import { parseJsonIfNeeded } from '@applicaster/zapp-react-native-utils/functionUtils';


const defaultFontSize = 20;

const isTriggerOnAppLaunch = (navigator) => {
  return R.pathOr(false, ['payload', 'home'], navigator.routeData());
};

function getPluginData(screenData) {
  let pluginData = {};

  if (screenData && screenData.general) {
    pluginData = { ...pluginData, ...screenData.general };
    validateStyles(pluginData);
  }

  return pluginData;
}

function validateStyles(pluginData) {
  const keys = Object.keys(pluginData);
  keys.forEach((key) => {
    const type = key.split('_').pop();
    if (type === 'fontsize') {
      validateFontsize(key, pluginData);
    }
  });
}

const validateFontsize = (key, pluginData) => {
  const value = pluginData[key];
  const num = Number(value);
  pluginData[key] = Number.isFinite(num) ? num : defaultFontSize;
};

const isHook = (navigator) => {
  // need to check if it's a hook.
  // If it was ui_component && token in localstorage => logout screen;
  return !!R.propOr(false, 'hookPlugin')(navigator.routeData());
};

const goBack = (navigator) => {
  if (navigator.canGoBack()) {
    navigator.goBack();
  } else {
    navigator.goHome();
  }
};

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

export {
  isTriggerOnAppLaunch,
  getPluginData,
  isHook,
  goBack,
  setToLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  isTokenInStorage
};
