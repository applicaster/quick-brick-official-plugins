import React, { useContext } from 'react';
import {
  View,
  Text,
  ActivityIndicator
} from 'react-native';
import { PluginContext } from '../Config/PluginData';
import QRCode from './QRCode';

function QRBlock({ loading }) {
  const {
    registrationUrl,
    qrCodeHintStyle,
    customText: {
      qrCodeHint
    }
  } = useContext(PluginContext);

  return (
    <View style={styles.container}>
      {
        loading
          ? <ActivityIndicator size="large" color="#D8D8D8" />
          : (
            <>
              <QRCode url={registrationUrl} />
              <Text
                style={[qrCodeHintStyle, { marginTop: 22 }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {qrCodeHint}
              </Text>
            </>
          )
      }
    </View>
  );
}

export default QRBlock;

const styles = {
  container: {
    minWidth: 340,
    minHeight: 340,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 46,
    marginRight: 40
  }
};
