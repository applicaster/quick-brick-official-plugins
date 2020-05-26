import { postAnalyticEvent } from '@applicaster/zapp-react-native-utils/analyticsUtils/manager';
import EVENTS from './Events';
import authNAdapter from './Adapters/AuthNAdapter';
import authZAdapter from './Adapters/AuthZAdapter';

const pluginProvider = 'Adobe Authentication';


export default function trackEvent(event, props) {
  try {
    const isAuthN = Object.values(EVENTS.authN).includes(event);
    const data = isAuthN ? authNAdapter(props) : authZAdapter(props);
    const timestamp = Date.now();

    return postAnalyticEvent(event, {
      ...data,
      pluginProvider,
      timestamp
    });
  } catch (err) {
    console.log(err);
  }
}
