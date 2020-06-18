import md5 from 'md5';
import * as R from 'ramda';
import { stringify } from 'query-string';

import { mapKeys } from '@applicaster/zapp-react-native-utils/objectUtils';

const prefixParamKeys = mapKeys((key) => `api[${key}]`);

const createRequestSignature = R.compose(md5, R.reduce(R.concat, ''));

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

export { signRequest };
