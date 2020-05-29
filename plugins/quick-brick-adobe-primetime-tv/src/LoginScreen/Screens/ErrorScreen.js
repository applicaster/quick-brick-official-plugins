import React, { useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Platform
} from 'react-native';
import { useInitialFocus } from '@applicaster/zapp-react-native-utils/focusManager';
import { PluginContext } from '../Config/PluginData';
import Layout from '../Components/Layout';
import Button from '../Components/Button';
import ASSETS from '../Config/Assets';
import { hideMenu, showMenu } from '../Utils';


function ErrorScreen(props) {
  const {
    error,
    remoteHandler,
    navigator,
    skipLoginflow,
    startLogoutFlow,
    startAuthFlow
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
      return skipLoginflow();
    }
  };

  const onTryAgain = () => {
    const targetScreen = error?.screenName;
    return targetScreen === 'LOGOUT'
      ? startLogoutFlow()
      : startAuthFlow();
  };

  const retryButton = useRef(null);
  const closeButton = useRef(null);

  if (Platform.OS === 'android') {
    useInitialFocus(true, retryButton);
  }

  return (
    <Layout
      backgroundColor={errorScreenBackground}
      remoteHandler={remoteHandler}
    >
      <View style={styles.container}>
        <Text
          style={[styles.errorText, errorDescriptionStyle]}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {error.message}
        </Text>
        <Button
          label={retryLabel}
          onPress={onTryAgain}
          buttonRef={retryButton}
          nextFocusDown={closeButton}
          textStyle={retryButtonStyle}
          backgroundColor={retryButtonBackground}
          backgroundButtonUri={ASSETS.retryButtonBackground}
          backgroundButtonUriActive={ASSETS.retryButtonBackgroundActive}
        />
        <Button
          label={closeLabel}
          onPress={onClose}
          buttonRef={closeButton}
          nextFocusUp={retryButton}
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
    width: '100%'
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 95
  }
};

export default ErrorScreen;
