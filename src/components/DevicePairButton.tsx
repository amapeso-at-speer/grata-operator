import React, {useEffect} from 'react';
import {
  Alert,
  NativeEventEmitter,
  NativeModules,
  Text,
  TouchableOpacity,
} from 'react-native';
import {LockDevice} from '../types/LockDevice';

interface Props {
  device: LockDevice;
}

const DevicePairButton = ({device}: Props) => {
  const {AlfredLibraryModule} = NativeModules;

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.AlfredLibraryModule,
    );
    const onDevicePairListener = eventEmitter.addListener('onDevicePair', () =>
      onPairSuccess(),
    );
    const onDevicePairErrorListener = eventEmitter.addListener(
      'onDevicePairError',
      error => onPairError(error),
    );
    const onDeviceNotFoundListener = eventEmitter.addListener(
      'onDeviceNotFound',
      () => onDeviceNotFound(),
    );
    return () => {
      onDevicePairListener.remove();
      onDevicePairErrorListener.remove();
      onDeviceNotFoundListener.remove();
    };
  });

  const onPairSuccess = () => {
    console.log(`Device with masterId(${device.masterId}) successfully paired`);
    AlfredLibraryModule.connectLock(device.deviceId);
    // Alert.alert('Pair succeeded', `${device.name} successfully paired`);
  };

  const onPairError = (error: string) => {
    console.log(
      `Device with masterId(${device.masterId}) failed to pair: `,
      error,
    );
    Alert.alert('Pair failed', `${device.name} failed to pair: ${error}`);
  };

  const onDeviceNotFound = () => {
    console.log(`Device with masterId(${device.masterId}) could not be found`);
    Alert.alert('Device not found', `${device.name} could not be found`);
  };

  const bindToLock = () => {
    AlfredLibraryModule.bindToLock(device.masterId);
  };

  return (
    <TouchableOpacity onPress={bindToLock}>
      <Text>{device.name}</Text>
    </TouchableOpacity>
  );
};

export default DevicePairButton;
