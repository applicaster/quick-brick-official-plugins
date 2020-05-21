import React, { useState, useEffect, useContext } from 'react';
import { View } from 'react-native';
import Layout from '../Components/Layout';
import LogoutComponent from '../Components/LogoutComponent';
import { PluginContext } from '../Config/PluginData';
import { logOut } from '../../LoginPluginInterface';
import { getFromSessionStorage, hideMenu, showMenu } from '../Utils';


function LogoutScreen(props) {
  const {
    remoteHandler,
    navigator,
    credentials,
    errorCallback
  } = props;

  useEffect(() => {
    hideMenu(navigator);
    return () => showMenu(navigator);
  }, []);

  const [loading, setLoading] = useState(false);

  const {
    background: { loginScreenBackground }
  } = useContext(PluginContext);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const deviceId = await getFromSessionStorage('uuid');
      await logOut(deviceId, credentials);

      setLoading(false);

      if (navigator.canGoBack()) {
        navigator.goBack();
      }
    } catch (err) {
      console.log(err);
      err.screenName = 'LOGOUT';
      return errorCallback(err);
    }
  };

  const handleCancel = () => {
    if (navigator.canGoBack()) {
      navigator.goBack();
    }
  };

  return (
    <Layout
      backgroundColor={loginScreenBackground}
      remoteHandler={remoteHandler}
    >
      <View style={styles.container}>
        <LogoutComponent
          loading={loading}
          handleCancel={handleCancel}
          handleLogout={handleLogout}
        />
      </View>
    </Layout>
  );
}

const styles = {
  container: {
    paddingTop: 70,
    alignItems: 'center',
    height: '100%',
    width: '100%'
  }
};

export default LogoutScreen;
