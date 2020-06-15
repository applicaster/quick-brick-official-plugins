import { postAnalyticEvent } from '@applicaster/zapp-react-native-utils/analyticsUtils/manager';
import { Platform } from 'react-native';

const appVersion = 'Google Admob Interstitials';
const eventName = 'Ad Loading Failure';
const osVersion = Platform.OS;


export default function trackEvent(error, adUnitId) {
  try {
    const timestamp = Date.now();

    return postAnalyticEvent(eventName, {
      error,
      adUnitId,
      osVersion,
      appVersion,
      timestamp
    });
  } catch (err) {
    console.log(err);
  }
}
