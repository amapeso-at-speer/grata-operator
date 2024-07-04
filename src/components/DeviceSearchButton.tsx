import React, {useEffect} from 'react';
import {NativeModules, Button, Alert, NativeEventEmitter} from 'react-native';
import BluetoothStateManager from 'react-native-bluetooth-state-manager';

const DeviceSearchButton = () => {
  const {AlfredLibraryModule} = NativeModules;

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.AlfredLibraryModule,
    );
    const onDevicesSearchListener = eventEmitter.addListener(
      'onDevicesSearch',
      list => console.log('onDeviceSearch', list),
    );
    const onDevicesSearchErrListener = eventEmitter.addListener(
      'onDevicesSearchError',
      error => console.log('onDeviceSearchError', error),
    );
    return () => {
      onDevicesSearchListener.remove();
      onDevicesSearchErrListener.remove();
    };
  }, [AlfredLibraryModule]);

  const onPress = () => {
    BluetoothStateManager.getState().then(bluetoothState => {
      if (bluetoothState === 'PoweredOn') {
        AlfredLibraryModule.searchForLocks();
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
      onPress={onPress}
    />
  );
};

export default DeviceSearchButton;
