import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import AdditionalInfo from '../Components/AdditionalInfo';
import TextComponent from '../Components/TextComponent';
import QRBlock from '../Components/QRBlock';
import Layout from '../Components/Layout';
import { checkDeviceStatus, getRegistrationCode } from '../../LoginPluginInterface';
import { HEARBEAT } from '../../Adobe/Config';
import { PluginContext } from '../Config/PluginData';
import {
  hideMenu,
  setToLocalStorage,
  getFromSessionStorage,
  showMenu
} from '../Utils';


function SignInScreen(props) {
  const {
    payload,
    navigator,
    credentials,
    closeHook,
    errorCallback,
    remoteHandler
  } = props;

  let heartbeat;

  const [pinCode, setPincode] = useState('');
  const [loading, setLoading] = useState(true);
  const [device, setDevice] = useState('');

  useEffect(() => {
    hideMenu(navigator);
    signIn();
    return () => {
      showMenu(navigator);
      clearInterval(heartbeat);
    };
  }, []);

  useEffect(() => {
    heartbeat = setInterval(() => {
      getSignInStatus(device);
    }, HEARBEAT);
  }, [device]);

  const {
    background: { loginBackground },
    isAdditionalInfo
  } = useContext(PluginContext);

  const signIn = async () => {
    try {
      const deviceId = await getFromSessionStorage('uuid');
      const code = await getRegistrationCode(deviceId, credentials);

      setDevice(deviceId);
      setLoading(false);
      setPincode(code);
    } catch (err) {
      console.log(err);
      err.screenName = 'LOGIN';
      return errorCallback(err);
    }
  };

  const getSignInStatus = async (deviceId) => {
    try {
      const userId = await checkDeviceStatus(deviceId, credentials);
      if (userId) {
        await setToLocalStorage('idToken', userId);
        clearInterval(heartbeat);
        return closeHook ? closeHook({ success: true, payload }) : navigator.goBack();
      }
    } catch (err) {
      console.log(err);
      err.screenName = 'LOGIN';
      return errorCallback(err);
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
