import React, { useEffect } from 'react';
import { BackHandler, View } from 'react-native';


export default function AndroidRemoteComponent({ tvEventHandler, children }) {
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', tvEventHandler);

    return () => BackHandler.removeEventListener('hardwareBackPress', tvEventHandler);
  }, []);

  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
};
