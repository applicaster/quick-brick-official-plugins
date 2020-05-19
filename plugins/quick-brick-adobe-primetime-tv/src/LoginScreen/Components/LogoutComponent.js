import React, { useContext } from 'react';
import { Text, View, ActivityIndicator } from 'react-native';
import Button from './Button';
import ASSETS from '../Config/Assets';
import { PluginContext } from '../Config/PluginData';


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
                  textStyle={confirmButtonStyle}
                  backgroundColor={confirmButtonBackground}
                  backgroundButtonUri={ASSETS.retryButtonBackground}
                  backgroundButtonUriActive={ASSETS.retryButtonBackgroundActive}
                />
                <Button
                  label={customText.cancelLabel}
                  onPress={handleCancel}
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
    width: '100%',
    alignItems: 'center'
  },
  buttonContainer: {
    minHeight: 90,
    marginTop: 95
  }
};
