import React, { Component } from 'react';
import * as R from 'ramda';
import {
  NativeModules,
  StyleSheet,
  ActivityIndicator,
  NativeEventEmitter,
  View,
  Alert
} from 'react-native';
import { connectToStore } from '@applicaster/zapp-react-native-redux';
import ProvidersList from './Components/ProvidersList';
import NavbarComponent from './Components/NavbarComponent';
import { getCustomPluginData, PluginContext } from './Config/PluginData';
import {
  isTriggerOnAppLaunch,
  isHook,
  goBack,
  isTokenInStorage,
  hideMenu
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
      dataSource: null
    };
  }

  componentDidMount() {
    const { screenData = {}, navigator } = this.props;
    this.setState({ loading: true });
    hideMenu(navigator);
    this.initAdobeAccessEnabler(screenData);
    this.startFlow();
  }

  componentWillUnmount() {
    this.subscription.remove();
    this.props.navigator.showNavBar();
  }

  initAdobeAccessEnabler = ({ general: data }) => {
    // Initialize AccessEnabler
    this.accessEnabler = adobeAccessEnabler;
    this.accessEnabler.setupAccessEnabler(data);

    // subscribe on update of mvpds
    this.subscription = adobeEventsListener.addListener(
      'showProvidersList',
      (response) => {
        this.setState({ loading: false, dataSource: response });
      }
    );
  };

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
      this.setState({ loading: true });

      if (response && response.token) {
        this.setState({ loading: false });
        this.successHook();
      } else {
        this.setState({ loading: false });
        this.closeHook();
      }
    } catch (err) {
      console.log(err);
    }
  };

  logOut = (navigator) => {
    try {
      this.setState({ loading: true });

      this.accessEnabler.logout(() => {
        this.setState({ loading: false });
        goBack(navigator);
      });
    } catch (err) {
      console.log(err);
    }
  };

  setProviderID = (id) => {
    this.setState({ loading: true });
    this.accessEnabler.setProviderID(id);
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
          <NavbarComponent closeHook={this.closeHook} />
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
