import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import AdditionalInfo from '../Components/AdditionalInfo';
import TextComponent from '../Components/TextComponent';
import QRBlock from '../Components/QRBlock';
import Layout from '../Components/Layout';
import { getRegistrationCode } from '../../LoginPluginInterface';
import { PluginContext } from '../Config/PluginData';
import {
  hideMenu,
  showMenu,
  getDeviceId
} from '../Utils';
import trackEvent from '../../Analytics';
import EVENTS from '../../Analytics/Events';


function SignInScreen(props) {
  const {
    payload,
    navigator,
    credentials,
    errorCallback,
    remoteHandler
  } = props;

  const [pinCode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState('');

  useEffect(() => {
    hideMenu(navigator);
    signIn();
    return () => {
      showMenu(navigator);
    };
  }, []);

  const {
    background: { loginBackground },
    isAdditionalInfo
  } = useContext(PluginContext);

  const signIn = async () => {
    try {
      const deviceId = await getDeviceId();
      trackEvent(
        EVENTS.authN.registrationActivated,
        { credentials, payload, deviceId }
      );
      const code = await getRegistrationCode(deviceId, credentials);

      setDevice(deviceId);
      setLoading(false);
      setPincode(code);
    } catch (error) {
      console.log(error);
      trackEvent(
        EVENTS.authN.registrationFailed,
        {
          credentials,
          payload,
          error,
          deviceId: device
        }
      );
      error.screenName = 'LOGIN';
      return errorCallback(error);
    }
  };

  return (
    <Layout
      backgroundColor={loginBackground}
      remoteHandler={remoteHandler}
    >
      <View style={styles.columnsContainer}>
        <View style={styles.textContainer}>
          <TextComponent
            loading={loading}
            pinCode={pinCode}
          />
          {
            isAdditionalInfo
            && <AdditionalInfo />
          }
        </View>
        <View style={styles.qrContainer}>
          <QRBlock loading={loading} />
        </View>
      </View>
    </Layout>
  );
}

const styles = {
  columnsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textContainer: {
    flex: 1,
    alignItems: 'flex-start'
  },
  qrContainer: {
    flex: 1,
    alignItems: 'flex-end'
  }
};

export default SignInScreen;
