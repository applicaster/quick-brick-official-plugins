import React from 'react';
import { Platform } from 'react-native';
import { TVEventHandlerComponent } from '@applicaster/zapp-react-native-tvos-ui-components/Components/TVEventHandlerComponent';
import AndroidRemoteComponent from './AndroidRemoteComponent';


export default function TVRemoteHandlerComponent({ tvEventHandler, children }) {

  const renderAndroidRemoteComponent = () => {
    return (
      <AndroidRemoteComponent tvEventHandler={tvEventHandler}>
        {children}
      </AndroidRemoteComponent>
    );
  };

  const renderTvOSRemoteComponent = () => {
    return (
      <TVEventHandlerComponent tvEventHandler={tvEventHandler}>
        {children}
      </TVEventHandlerComponent>
    );
  };

  const selectRemote = (platform) => {
    const remoteHandlers = {
      android: renderAndroidRemoteComponent,
      ios: renderTvOSRemoteComponent
    };

    return remoteHandlers[platform]();
  };

  return selectRemote(Platform.OS);
}
