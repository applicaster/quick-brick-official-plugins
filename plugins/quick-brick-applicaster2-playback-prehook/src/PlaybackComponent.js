import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { localStorage } from '@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage';
import * as R from 'ramda';

export default function PlaybackComponent(props) {
  const {
    configuration,
    payload,
    callback
  } = props;

  useEffect(() => {
    validateRequest()
      .catch((err) => console.log(err));
  }, []);

  const requireAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);

  const successHook = () => callback({ success: true, payload });

  const validateRequest = async () => {
    if (!requireAuth) return successHook();
    const token = await localStorage.getItem('idToken');

  };

  return (
    <View>
      <ActivityIndicator />
    </View>
  );
}
