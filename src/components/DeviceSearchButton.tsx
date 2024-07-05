import React, {useContext, useEffect} from 'react';
import {NativeModules, NativeEventEmitter, Button, Alert} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';
import {DeviceContext} from '../context/DeviceContext';
import {LockDevice} from '../types/LockDevice';

const DeviceSearchButton = () => {
  const {AlfredLibraryModule} = NativeModules;
  const {isSearching, setIsSearching, setDevices} = useContext(DeviceContext);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.AlfredLibraryModule,
    );
    const onDevicesSearchListener = eventEmitter.addListener(
      'onDevicesSearch',
      list => onSearchSuccess(list),
    );
    const onDevicesSearchErrListener = eventEmitter.addListener(
      'onDevicesSearchError',
      error => onSearchError(error),
    );
    return () => {
      onDevicesSearchListener.remove();
      onDevicesSearchErrListener.remove();
    };
  });

  const onSearchSuccess = (list: string) => {
    console.log('onDevicesSearchListener', list);
    setDevices(JSON.parse(list) as LockDevice[]);
    setIsSearching(false);
  };

  const onSearchError = (error: string) => {
    console.log('onDevicesSearchError', error);
    setDevices([]);
    setIsSearching(false);
  };

  const startSearch = () => {
    BluetoothStateManager.getState().then(bluetoothState => {
      if (bluetoothState === 'PoweredOn') {
        AlfredLibraryModule.searchForLocks();
        setDevices([]);
        setIsSearching(true);
      } else {
        Alert.alert(
          'Bluetooth required',
          'Enable Bluetooth to search for devices.',
        );
      }
    });
  };

  return (
    <Button
      title="Click to Search for Locks"
      color="#841584"
      disabled={isSearching}
      onPress={startSearch}
    />
  );
};

export default DeviceSearchButton;
