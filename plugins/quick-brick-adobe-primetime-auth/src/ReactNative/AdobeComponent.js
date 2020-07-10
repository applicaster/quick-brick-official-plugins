import React, { Component } from 'react';
import * as R from 'ramda';
import axios from 'axios';
import {
  NativeModules,
  StyleSheet,
  ActivityIndicator,
  NativeEventEmitter,
  View,
  Alert
} from 'react-native';
import { localStorage as defaultStorage } from "@applicaster/zapp-react-native-bridge/ZappStorage/LocalStorage";
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import ProvidersList from './Components/ProvidersList';
import NavbarComponent from './Components/NavbarComponent';
import { getCustomPluginData, PluginContext } from './Config/PluginData';
import session from './Config/Session';
import {
  isTriggerOnAppLaunch,
  isHook,
  goBack,
  isTokenInStorage,
  removeFromLocalStorage
} from './Utils';


const storeConnector = connectToStore((state) => { // Store connector entity to obtain screen data
  const values = Object.values(state.rivers);
  const screenData = values.find(
    ({ type }) => type === 'adobe-primetime-auth-qb'
  );
  return { screenData };
});
// Native module that will receive events (login, etc...)
const adobeAccessEnabler = NativeModules.AdobePassContract;
// Native module that will send events to RN
const adobeEventsListener = new NativeEventEmitter(adobeAccessEnabler);

class AdobeComponent extends Component {
  pluginData = getCustomPluginData(this.props.screenData);

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      dataSource: null,
      customLogosData: null,
      pickedProvider: null
    };
  }

  componentDidMount() {
    const {
      screenData = {},
      navigator,
      payload = {},
      callback,
      configuration
    } = this.props;

    const requiresAuth = R.pathOr(false, ['extensions', 'requires_authentication'], payload);
    if (!R.isEmpty(payload) && !requiresAuth) {
      return callback({ success: true, payload });
    }
    const data = R.mergeDeepRight(screenData.general, configuration);
    this.initPlugin(navigator, data);
  }

  componentWillUnmount() {
    session.isStarted = false;
    if (this.subscription) {
      this.subscription.remove();
    }
  }

  initPlugin = async (navigator, data) => {
    const isToken = await isTokenInStorage('idToken');

    if (data.enable_custom_logos === true) {
      await this.prepareCustomMVPDLogos(data);
    }

    // Core initiates plugin 2 times - that breaks the flow in case of logout
    if (!session.isStarted) {
      if (!isHook(navigator) && isToken) { // if logout flow is invoked for the first time
        session.isStarted = true; // add flag to avoid second mounting
      }
      this.initAdobeAccessEnabler(data);
      return this.startFlow();
    }
  }

  prepareCustomMVPDLogos = async ({ custom_logos_json_file: fileUrl = '' }) => {
    try{
      if (!fileUrl) return;

      const { data = {} } = await axios.get(fileUrl);
      const { MVPD_list: mvpdList } = data;
      this.setState({ customLogosData: mvpdList });
    } catch (err) {
      console.log(err)
    }
  }

  initAdobeAccessEnabler = (data) => {
    this.setState({ loading: true });
    // Initialize AccessEnabler
    this.accessEnabler = adobeAccessEnabler;
    this.accessEnabler.setupAccessEnabler(data);

    // subscribe on update of mvpds
    this.subscription = adobeEventsListener.addListener(
        'showProvidersList',
        (response) => {
          const providersList = this.state.customLogosData
              ? this.updateProvidersList(response)
              : response;
          this.setState({ loading: false, dataSource: providersList });
        }
    );
  };

  updateProvidersList = (providersList) => {
    return R.map(provider => this.mergeProviders(provider, this.state.customLogosData), providersList);
  }

  mergeProviders = (provider, customProviders) => {
    const customProvider =  customProviders[provider.id];
    return customProvider ? R.mergeDeepRight(provider, customProvider) : provider;
  }

  startFlow = async () => {
    try {
      const { navigator } = this.props;
      const isToken = await isTokenInStorage('idToken');

      if (isToken) {
        return isHook(navigator) ? this.loginFlow() : this.logoutFlow();
      }
      return this.loginFlow();
    } catch (err) {
      console.log(err);
      return this.loginFlow();
    }
  };

  logoutFlow = () => {
    const logoutText = R.pathOr('', ['customText', 'logoutDialogMessageText'], this.pluginData);
    const { navigator } = this.props;

    Alert.alert(
      '',
      logoutText,
      [
        { text: 'Cancel', onPress: () => goBack(navigator), style: 'cancel' },
        { text: 'OK', onPress: () => this.logOut(navigator) },
      ],
      { cancelable: false }
    );
  };

  loginFlow = () => {
    const { payload = {}, navigator } = this.props;
    const { title = 'N/A', id = 'N/A' } = payload;

    const additionalParams = {
      isTriggerOnAppLaunch: isTriggerOnAppLaunch(navigator),
      itemTitle: title,
      itemID: id
    };

    // startLoginFlow on AccessEnabler
    this.accessEnabler.startLoginFlow(additionalParams, this.handleResponseFromLogin);
  };

  handleResponseFromLogin = (response) => {
    try {
      const hasToken = R.propOr(false, 'token');
      const hasError = R.propOr(false, 'errorMessage');

      if (hasToken(response)) return this.handleSuccessLoginResponse();
      if (hasError(response)) return this.handleErrorLoginResponse(response.errorMessage);

      return this.closeHook();
    } catch (err) {
      console.log(err);
    }
  };

  handleSuccessLoginResponse = async () => {
    const pickedProvider = this.state.pickedProvider;
    if (pickedProvider !== null) {
      await defaultStorage.setItem('authProviderID', pickedProvider);
    }
    return this.successHook();
  }

  handleErrorLoginResponse = async (errorMessage) => {
    const { payload = {} } = this.props;
    const isToken = await isTokenInStorage('idToken');
    const isPlayerHook = !R.isEmpty(payload);

    if (!isPlayerHook && isToken) {
      return this.closeHook();
    }
    Alert.alert(
      '',
      errorMessage,
      [
        { text: 'OK', onPress: () => this.closeHook() },
      ],
      { cancelable: false }
    );
  }

  logOut = (navigator) => {
    try {
      this.setState({ loading: true });

      this.accessEnabler.logout(async () => {
        await removeFromLocalStorage('authProviderID');
        this.setState({ loading: false });
        goBack(navigator);
      });
    } catch (err) {
      console.log(err);
    }
  };

  setProviderID = (item) => {
    this.setState({ loading: true , pickedProvider: item });
    this.accessEnabler.setProviderID(item.id);
  };

  closeHook = () => {
    const { callback, payload, navigator } = this.props;
    return callback
      ? callback({ success: false, payload })
      : navigator.goBack();
  };

  successHook = () => {
    const { callback, payload, navigator } = this.props;
    return callback
      ? callback({ success: true, payload })
      : navigator.goBack();
  };

  renderActivityIndicator = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="white" />
    </View>
  );

  renderPickerScreen() {
    const { dataSource } = this.state;

    return (
      <PluginContext.Provider value={this.pluginData}>
        <View style={styles.pickerScreenContainer}>
          <NavbarComponent />
          <ProvidersList data={dataSource} setProviderID={this.setProviderID} />
        </View>
      </PluginContext.Provider>
    );
  }

  render() {
    const { loading } = this.state;

    return (
      loading
        ? this.renderActivityIndicator()
        : this.renderPickerScreen()
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pickerScreenContainer: {
    flex: 1
  }
});

export default storeConnector(AdobeComponent);
