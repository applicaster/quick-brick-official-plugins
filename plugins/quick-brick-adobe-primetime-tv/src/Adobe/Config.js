import { uuidv4 } from './Utils';

export const defaultHeaders = {
  Accept: 'application/json'
};

export const HEARBEAT = 5000;

export function createUrlAuthService(flowType, deviceId, baseUrl, requestorId) {
  const device = deviceId || uuidv4();
  return `https://${baseUrl}/api/v1/${flowType}?deviceId=${device}&requestor=${requestorId}`;
}

export function createUrlRegService(deviceId, baseUrl, requestorId) {
  const device = deviceId || uuidv4();
  return `https://${baseUrl}/reggie/v1/${requestorId}/regcode?deviceId=${device}`;
}

export function createQrCodeUrl(url, w, h) {
  return `https://chart.googleapis.com/chart?cht=qr&chs=${w}x${h}&chld=L|1&chl=${url}`;
}
