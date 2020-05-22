import * as R from 'ramda';
import { defaultHeaders } from '../Adobe/Config';

export default class HTTP {
  static post(url, headers, data) {
    return fetch(url, {
      headers: R.mergeDeepLeft(headers, defaultHeaders),
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static get(url, headers) {
    return fetch(url, {
      headers: R.mergeDeepLeft(headers, defaultHeaders),
      method: 'GET'
    });
  }

  static delete(url, headers) {
    return fetch(url, {
      headers: R.mergeDeepLeft(headers, defaultHeaders),
      method: 'DELETE'
    });
  }
}
