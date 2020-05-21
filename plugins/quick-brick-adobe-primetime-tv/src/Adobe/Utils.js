/* eslint-disable no-bitwise */
import CryptoJS from 'crypto-js';

export function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-mixed-operators
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function getAdobeAuthHeader(verb, requestorId, requestUri, publicKey, secretKey) {
  // eslint-disable-next-line operator-linebreak
  const authorizationParams =
    `${verb} requestor_id=${requestorId}, nonce=${uuidv4()}, signature_method=HMAC-SHA1, request_time=${Date.now()}, request_uri=${requestUri}`;

  const secretKeyEncoded = CryptoJS.enc.Utf8.parse(secretKey);
  const contentEncoded = CryptoJS.enc.Utf8.parse(authorizationParams);

  const signatureBytes = CryptoJS.HmacSHA1(contentEncoded, secretKeyEncoded);
  const signatureBase64String = CryptoJS.enc.Base64.stringify(signatureBytes);

  return `${authorizationParams}, public_key=${publicKey}, signature=${signatureBase64String}`;
}
