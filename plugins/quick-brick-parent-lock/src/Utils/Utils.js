import * as R from "ramda";
import { localStorage as storage } from "@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage";
import { parseJsonIfNeeded } from "@applicaster/zapp-react-native-utils/functionUtils";

const defaultFontSize = 20;

export function getPluginData(screenData) {
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
    const type = key.split("_").pop();
    if (type === "fontsize") {
      validateFontsize(key, pluginData);
    }
  });
}

const validateFontsize = (key, pluginData) => {
  const value = pluginData[key];
  const num = Number(value);
  pluginData[key] = Number.isFinite(num) ? num : defaultFontSize;
};

export function createChallenge(textTranform) {
  const names = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const firstNum = getRandomInt(10, 1);
  const minimalValue = Math.ceil(10 / firstNum);

  let secondNum = 0;
  if (firstNum === 10) {
    secondNum = getRandomInt(9, 1);
  } else {
    secondNum = getRandomInt(10, minimalValue);
  }
  let resultString = names[firstNum - 1] + " x " + names[secondNum - 1];
  resultString = updateString(resultString, textTranform);
  const result = firstNum * secondNum;
  return { string: resultString, number: result };
}

export function updateString(str, textTransform) {
  switch (textTransform) {
    case "Uppercase":
      return str.toUpperCase();
    case "Lowercase":
      return str.toLowerCase();
    case "Capitalize":
      return str.replace(/^\w/, (c) => c.toUpperCase());
  }
  return str;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
