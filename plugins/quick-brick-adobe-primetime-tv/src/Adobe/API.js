import HTTP from '../HttpService';
import { getAdobeAuthHeader } from './Utils';
import { createUrlAuthService, createUrlRegService } from './Config';


class API {
  static async checkAuthN(deviceId, credentials) {
    const flowType = 'tokens/authn';
    const {
      baseUrl,
      requestorId,
      privateKey,
      publicKey
    } = credentials;

    const authHeader = getAdobeAuthHeader(
      'GET',
      requestorId,
      '/authn',
      publicKey,
      privateKey
    );

    const url = createUrlAuthService(flowType, deviceId, baseUrl, requestorId);
    const response = await HTTP.get(url, { Authorization: authHeader });
    return response.json();
  }

  static async register(deviceId, credentials) {
    const {
      baseUrl,
      requestorId,
      privateKey,
      publicKey
    } = credentials;

    const authHeader = getAdobeAuthHeader(
      'POST',
      requestorId,
      '/regcode',
      publicKey,
      privateKey
    );

    const url = createUrlRegService(deviceId, baseUrl, requestorId);
    const response = await HTTP.post(url, { Authorization: authHeader });
    return response.json();
  }
}

export default API;
