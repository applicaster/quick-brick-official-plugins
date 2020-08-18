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

  const requireAuth = R.pathOr(false, CONFIG.PAYLOAD_REQUIRE_AUTH_PATH, payload);

  const successHook = () => callback({ success: true, payload });
  const closeHook = () => callback({ success: false, payload });

  // eslint-disable-next-line consistent-return
  const validateRequest = async () => {
    try {
      if (!requireAuth) return successHook();
      const token = await localStorage.getItem('idToken');
      const applicasterData = await sessionStorage.getAllItems(CONFIG.APPLICASTER2_NAMESPACE);

      if (applicasterData) {
        const updatedData = removeAllQuotes(applicasterData);
        callApplicaster2(updatedData, token);
      } else {
        throw new Error('applicaster data is missing from storage');
      }
    } catch (err) {
      console.log(err);
      closeHook();
    }
  };

  const getItemId = (key) => {
    const dataSourceUrl = R.path(CONFIG.LINK_HREF_PATH, payload);

    const { query } = url.parse(dataSourceUrl, true);
    return (query && query[key]) ? query[key] : null;
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

    const {
      broadcasterId,
      accountId,
      bundleIdentifier: bundle,
      apiSecretKey,
      os_type: osType,
      advertisingIdentifier: uuid = uuidv4()
    } = applicasterData;

    const channelUrl = `${CONFIG.BASE_URL}/${accountId}/channels/${itemId}.json`;
    const vodUrl = `${CONFIG.BASE_URL}/${accountId}/broadcasters/${broadcasterId}/vod_items/${itemId}.json`;

    const applicaster2Url = R.compose(
      R.cond([
        [isChannelItem, R.always(channelUrl)],
        [isVodItem, R.always(vodUrl)],
        [R.isNil, R.always(vodUrl)]
      ]),
      getPayloadType
    )(payload);

    const requestParams = {
      bundle,
      bver: CONFIG.bver,
      os_type: osType,
      os_version: CONFIG.os_version,
      ver: CONFIG.ver,
      uuid,
      timestamp
    };

    const signQuery = signRequest(applicaster2Url, apiSecretKey, requestParams);
    const signedUrl = `${applicaster2Url}?${signQuery}`;
    const headers = getHeaders(token, uuid, props);

    axios.get(signedUrl, { headers })
      .then(handleApplicaster2Response)
      .catch(handleErrorResponse);
  };

  const handleErrorResponse = (err) => {
    const message = CONFIG.REQUEST_TO_APPLICASTER2_FAILED_ERROR_MESSAGE;
    callback({ success: false, error: new Error(message) });
  };

  const handleApplicaster2Response = ({ data }) => {
    const streamUrl = R.compose(
      R.ifElse(
        R.hasPath(CONFIG.CHANNEL_STREAM_URL_PATH),
        R.path(CONFIG.CHANNEL_STREAM_URL_PATH),
        R.path(CONFIG.VOD_ITEM_STREAM_URL_PATH)
      )
    )(data);

    const newPayload = R.mergeDeepRight(
      payload,
      { content: { src: streamUrl }, link: { href: '' } }
    );

    callback({ success: true, payload: newPayload });
  };

  return (
    <View>
      <ActivityIndicator />
    </View>
  );
}
