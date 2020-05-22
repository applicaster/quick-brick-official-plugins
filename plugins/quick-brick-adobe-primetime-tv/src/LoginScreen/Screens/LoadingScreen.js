import React from 'react';
import { View, ActivityIndicator } from 'react-native';


export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center'
  }
};
