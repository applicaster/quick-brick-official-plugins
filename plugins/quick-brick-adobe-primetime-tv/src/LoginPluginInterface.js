import API from './Adobe/API';
import { removeFromLocalStorage } from './LoginScreen/Utils';
import { getResourceForAuthZ, b64DecodeUnicode } from './Adobe/Utils';

async function checkDeviceStatus(deviceId, credentials) {
  const response = await API.checkAuthN(deviceId, credentials);
  return response?.userId;
}

async function getRegistrationCode(deviceId, credentials) {
  const { code } = await API.register(deviceId, credentials);
  return code;
}

async function logOut(deviceId, credentials) {
  const { status } = await API.logout(deviceId, credentials);
  if (status === 204) {
    await removeFromLocalStorage('idToken');
    await removeFromLocalStorage('userId');
  }
}

async function authorizeContent(deviceId, credentials, payload) {
  const { resourceId } = credentials;
  const { id, title } = payload;
  const resource = getResourceForAuthZ(resourceId, id, title);
  const response = await API.authZ(deviceId, credentials, resource);

  if (response.details) throw Error(response.details);

  return resource;
}

async function getAuthZToken(deviceId, credentials, resource) {
  const response = await API.getMediaToken(deviceId, credentials, resource);

  if (!response.serializedToken) throw Error(response.message);

  const { serializedToken = '' } = response;
  return b64DecodeUnicode(serializedToken);
}

export {
  checkDeviceStatus,
  logOut,
  getRegistrationCode,
  authorizeContent,
  getAuthZToken
};
