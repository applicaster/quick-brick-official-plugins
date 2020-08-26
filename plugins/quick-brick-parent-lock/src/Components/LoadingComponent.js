import React from 'react';
import { ActivityIndicator, SafeAreaView, Dimensions } from "react-native";

export default function LoadingComponent() {
  return (
    <SafeAreaView style={styles.container}>
      <ActivityIndicator color="white" size="large" />
    </SafeAreaView>
  )
}

const styles = {
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
}
