import * as R from 'ramda';
import { parseJsonIfNeeded } from '@applicaster/zapp-react-native-utils/functionUtils';
import { localStorage as storage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';

export async function getFromLocalStorage(key, namespace) {
  return storage.getItem(key, namespace);
}

export async function isItemInStorage(key, namespace) {
  try {
    let item = await getFromLocalStorage(key, namespace);

    if (item === null) return false;

    if (typeof item === 'string') {
      item = parseJsonIfNeeded(item);
    }

    if (Array.isArray(item)) return !!item.length;
    if (typeof item === 'object') return !R.isEmpty(item);

    return !!item;
  } catch (err) {
    console.log(err);
    return false;
  }
}
