import API from './Adobe/API';
import { removeFromLocalStorage } from './LoginScreen/Utils';

async function checkDeviceStatus(deviceId, credentials) {
  const response = await API.checkAuthN(deviceId, credentials);
  return response?.userId;
}

async function getRegistrationCode(deviceId, credentials) {
  const { code } = await API.register(deviceId, credentials);
  return code;
}

async function logOut(deviceId, credentials) {
  const response = await API.logout(deviceId, credentials);
  if (response.status === 204) {
    await removeFromLocalStorage('idToken');
  }
}

export {
  checkDeviceStatus,
  logOut,
  getRegistrationCode
};
