import React, { useContext, useRef } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { useInitialFocus } from '@applicaster/zapp-react-native-utils/focusManager';
import Button from './Button';
import ASSETS from '../Config/Assets';
import { PluginContext } from '../Config/PluginData';

const { width } = Dimensions.get('window');


export default function LogoutComponent(props) {
  const {
    handleLogout,
    handleCancel,
    loading = false
  } = props;

  const {
    confirmButtonStyle,
    cancelButtonStyle,
    confirmationMessageStyle,
    customText,
    background: {
      confirmButtonBackground,
      cancelButtonBackground
    }
  } = useContext(PluginContext);

  const confirmButton = useRef(null);
  const cancelButton = useRef(null);

  if (Platform.OS === 'android') {
    useInitialFocus(true, confirmButton);
  }

  return (
    <View style={styles.container}>
      <Text
        style={confirmationMessageStyle}
        numberOfLines={4}
        ellipsizeMode="tail"
      >
        {customText.confirmationMessage}
      </Text>
      <View style={styles.buttonContainer}>
        {
          loading
            ? <ActivityIndicator color="white" size="large" />
            : (
              <>
                <Button
                  label={customText.confirmLabel}
                  onPress={handleLogout}
                  buttonRef={confirmButton}
                  nextFocusDown={cancelButton}
                  textStyle={confirmButtonStyle}
                  backgroundColor={confirmButtonBackground}
                  backgroundButtonUri={ASSETS.retryButtonBackground}
                  backgroundButtonUriActive={ASSETS.retryButtonBackgroundActive}
                />
                <Button
                  label={customText.cancelLabel}
                  onPress={handleCancel}
                  buttonRef={cancelButton}
                  nextFocusUp={confirmButton}
                  textStyle={cancelButtonStyle}
                  backgroundColor={cancelButtonBackground}
                  backgroundButtonUri={ASSETS.closeButtonBackground}
                  backgroundButtonUriActive={ASSETS.closeButtonBackgroundActive}
                />
              </>
            )
        }
      </View>
    </View>
  );
}

const styles = {
  container: {
    paddingTop: 70,
    alignItems: 'center',
    height: '100%',
    width
  },
  buttonContainer: {
    minHeight: 90,
    marginTop: 95
  }
};
