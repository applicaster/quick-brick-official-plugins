import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import url from 'url';
import { localStorage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';
import { sessionStorage } from '@applicaster/zapp-react-native-bridge/ZappStorage/SessionStorage';
import * as R from 'ramda';
import axios from 'axios';
import CONFIG from './Config';
import {
  signRequest,
  getHeaders,
  uuidv4,
  removeAllQuotes
} from './Utils';


export default function PlaybackComponent(props) {
  const {
    payload,
    callback
  } = props;

  useEffect(() => {
    validateRequest()
      .catch((err) => console.log(err));
  }, []);

  const requireAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);

  const successHook = () => callback({ success: true, payload });
  const closeHook = () => callback({ success: false, payload });

  // eslint-disable-next-line consistent-return
  const validateRequest = async () => {
    try {
      if (!requireAuth) return successHook();
      const token = await localStorage.getItem('idToken');
      const storage = await sessionStorage.getAllItems();

      const applicasterData = R.path(CONFIG.PATH_TO_APPLICASTER2_NAMESPACE, storage);
      if (applicasterData) {
        callApplicaster2(applicasterData, token);
      }
    } catch (err) {
      console.log(err);
      closeHook();
    }
  };

  const getItemId = (key) => {
    console.log(payload, 'payload in getItemId');
    const dataSourceUrl = R.path(CONFIG.LINK_HREF_PATH, payload);

    const { query } = url.parse(dataSourceUrl, true);
    if (query && query[key]) {
      return query[key];
    }

    return null;
  };

  const callApplicaster2 = (applicasterData, token) => {
    const isChannelItem = R.propEq('value', 'channel');
    const isVodItem = R.propEq('value', 'video');
    const getPayloadType = R.propOr(R.always(null), 'type');
    const timestamp = Math.floor(Date.now() / 1000, 0);

    const itemId = R.compose(
      R.cond([
        [isChannelItem, () => getItemId('channelId')],
        [isVodItem, () => getItemId('itemId')],
        [R.isNil, () => getItemId('itemId')]
      ]),
      getPayloadType
    )(payload);

    const updatedData = removeAllQuotes(applicasterData);

    const {
      broadcasterId,
      accountId,
      bundleIdentifier: bundle,
      apiSecretKey,
      ver: bver,
      version_name,
      os_type = 'ios',
      advertisingIdentifier: uuid = uuidv4()
    } = updatedData;

    const channelUrl = `${CONFIG.BASE_URL}/${accountId}/channels/${itemId}.json`;
    const VodUrl = `${CONFIG.BASE_URL}/${accountId}/broadcasters/${broadcasterId}/vod_items/${itemId}.json`;

    const applicaster2Url = R.compose(
      R.cond([
        [isChannelItem, R.always(channelUrl)],
        [isVodItem, R.always(VodUrl)],
        [R.isNil, R.always(VodUrl)]
      ]),
      getPayloadType
    )(payload);

    const requestParams = {
      bundle,
      bver,
      os_type,
      os_version: CONFIG.os_version,
      ver: CONFIG.ver,
      uuid,
      timestamp
    };

    const signedUrl = `${applicaster2Url}?${signRequest(
      applicaster2Url,
      apiSecretKey,
      requestParams
    )}`;

    const headers = getHeaders(token, uuid, props);
    axios
      .get(signedUrl, { headers })
      .then(handleApplicaster2Response)
      .catch(handleApplicaster2Response);
  };

  const handleApplicaster2Response = ({ data, status }) => {
    if (status !== 200) {
      callback({
        success: false,
        error: new Error(CONFIG.REQUEST_TO_APPLICASTER2_FAILED_ERROR_MESSAGE)
      });
      return;
    }
    const streamUrl = R.compose(
      R.ifElse(
        R.hasPath(CONFIG.CHANNEL_STREAM_URL_PATH),
        R.path(CONFIG.CHANNEL_STREAM_URL_PATH),
        R.path(CONFIG.VOD_ITEM_STREAM_URL_PATH)
      )
    )(data);
    const newPayload = { content: { src: streamUrl }, link: { href: '' } };
    callback({
      success: true,
      payload: R.mergeDeepRight(payload, newPayload)
    });
  };

  return (
    <View>
      <ActivityIndicator />
    </View>
  );
}
