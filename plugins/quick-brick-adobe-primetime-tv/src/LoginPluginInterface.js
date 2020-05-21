import API from './Adobe/API';

async function checkDeviceStatus(deviceId, credentials) {
  const response = await API.checkAuthN(deviceId, credentials);
  return response?.userId;
}

async function getRegistrationCode(deviceId, credentials) {
  const { code } = await API.register(deviceId, credentials);
  return code;
}

export {
  checkDeviceStatus,
  getRegistrationCode
};
