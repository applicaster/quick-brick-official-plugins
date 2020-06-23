import md5 from 'md5';
import * as R from 'ramda';
import { stringify } from 'query-string';
import jwt from 'react-native-jwt-io';
import moment from 'moment';
import { mapKeys } from '@applicaster/zapp-react-native-utils/objectUtils';
import CONFIG from '../Config';

const prefixParamKeys = mapKeys((key) => `api[${key}]`);
const createRequestSignature = R.compose(md5, R.reduce(R.concat, ''));


function getExpTime(adobeToken) {
  // Adobe issues fresh token every time the item is clicked
  // Keep expiryTime for applicaster2 only
  const issueTime = findInXml('issueTime', adobeToken);
  const [date, time, offset] = issueTime.split(' ');
  const utcDate = `${date}T${time}${offset}`;
  const issueMs = moment(utcDate).valueOf();

  const expiryTime = issueMs + CONFIG.ADOBE_EXP_IN;
  return Math.floor(expiryTime / 1000);
}

function findInXml(value, str) {
  const startVal = `<${value}>`;
  const endVal = `</${value}>`;

  return str.substring(
    str.lastIndexOf(startVal) + startVal.length,
    str.indexOf(endVal)
  );
}

function signRequest(url, apiSecretKey, params) {
  const prefixedParams = prefixParamKeys(params);

  const signatureParts = [
    apiSecretKey,
    url,
    stringify(prefixedParams, { encode: false }),
    apiSecretKey,
  ];

  const signature = createRequestSignature(signatureParts);

  return stringify({
    ...prefixedParams,
    'api[sig]': signature,
  });
}

function getAuthProviderId(props) {
  return R.path(CONFIG.CONFIG_AUTH_PROVIDER_ID_PATH, props);
}

function createJWT(data, props) {
  const jwtSecret = R.path(CONFIG.JWT_SECRET_PATH, props);

  if (!jwtSecret) throw new Error(CONFIG.NO_JWT_MESSAGE);
  return jwt.encode(data, jwtSecret);
}

function getHeaders(adobeToken, uuid, props) {
  if (!adobeToken) return {};

  const exp = getExpTime(adobeToken);
  const iss = findInXml('mvpdId', adobeToken);

  const data = { iss, exp, uuid };

  const jwtToken = createJWT(data, props);
  const authProviderId = getAuthProviderId(props);

  return {
    'Authorization-Tokens': JSON.stringify({ [authProviderId]: jwtToken })
  };
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-bitwise,no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function removeUnneededQuotes(string) {
  const QUOTE_REGEX = /"/g;
  const EMPTY_STRING = '';
  return R.replace(QUOTE_REGEX, EMPTY_STRING, string);
}

function removeAllQuotes(data) {
  const newData = {};
  const keys = Object.keys(data);
  keys.forEach((key) => {
    newData[key] = removeUnneededQuotes(data[key]);
  });
  return newData;
}

export {
  signRequest,
  getHeaders,
  uuidv4,
  removeAllQuotes
};
