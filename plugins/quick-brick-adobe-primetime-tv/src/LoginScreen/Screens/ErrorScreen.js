import React, { useContext, useEffect } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { PluginContext } from '../Config/PluginData';
import Layout from '../Components/Layout';
import Button from '../Components/Button';
import ASSETS from '../Config/Assets';
import { hideMenu, showMenu } from '../Utils';


const { width } = Dimensions.get('window');

function ErrorScreen(props) {
  const {
    error,
    remoteHandler,
    navigator,
    payload,
    closeHook,
    goToScreen
  } = props;

  useEffect(() => {
    hideMenu(navigator);
    return () => showMenu(navigator);
  }, []);

  const {
    errorDescriptionStyle,
    retryButtonStyle,
    closeButtonStyle,
    customText: {
      retryLabel,
      closeLabel
    },
    background: {
      errorScreenBackground,
      closeButtonBackground,
      retryButtonBackground
    }
  } = useContext(PluginContext);

  const onClose = () => {
    if (navigator.canGoBack()) {
      navigator.goBack();
    } else {
      closeHook({ success: false, payload });
    }
  };

  const onTryAgain = () => {
    const targetScreen = error?.screenName || 'LOGIN';
    goToScreen(targetScreen);
  };

  return (
    <Layout
      backgroundColor={errorScreenBackground}
      remoteHandler={remoteHandler}
    >
      <View style={styles.container}>
        <Text
          style={[styles.errorText, errorDescriptionStyle]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {error.message}
        </Text>
        <Button
          label={retryLabel}
          onPress={onTryAgain}
          textStyle={retryButtonStyle}
          backgroundColor={retryButtonBackground}
          backgroundButtonUri={ASSETS.retryButtonBackground}
          backgroundButtonUriActive={ASSETS.retryButtonBackgroundActive}
        />
        <Button
          label={closeLabel}
          onPress={onClose}
          textStyle={closeButtonStyle}
          backgroundColor={closeButtonBackground}
          backgroundButtonUri={ASSETS.closeButtonBackground}
          backgroundButtonUriActive={ASSETS.closeButtonBackgroundActive}
        />
      </View>
    </Layout>
  );
}

const styles = {
  container: {
    paddingTop: 70,
    paddingHorizontal: 200,
    alignItems: 'center',
    height: '100%',
    width
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 95
  }
};

export default ErrorScreen;
