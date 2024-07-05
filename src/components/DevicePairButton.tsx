import React, {useContext, useEffect} from 'react';
import {
  Alert,
  NativeEventEmitter,
  NativeModules,
  Text,
  TouchableOpacity,
} from 'react-native';
import {LockDevice} from '../types/LockDevice';
import {DeviceContext} from '../context/DeviceContext';

interface Props {
  device: LockDevice;
}

const DevicePairButton = ({device}: Props) => {
  const {AlfredLibraryModule} = NativeModules;
  const {setConnectedDevice} = useContext(DeviceContext);

  const EVENT_LISTENER_MAP = {
    onDevicePair: () => onPairSuccess(),
    onDevicePairErr: error => onPairError(error),
    onDeviceConnect: () => onConnectSuccess(),
    onConnectError: error => onConnectError(error),
    onDeviceNotFound: () => onDeviceNotFound(),
  };

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(
      NativeModules.AlfredLibraryModule,
    );

    const eventListeners = Object.keys(EVENT_LISTENER_MAP).map(event =>
      eventEmitter.addListener(event, EVENT_LISTENER_MAP[event]),
    );

    return () => {
      eventListeners.forEach(listener => listener.remove());
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

  const onConnectSuccess = () => {
    console.log(
      `Device with deviceId(${device.deviceId}) successfully connected`,
    );
    setConnectedDevice(device);
    Alert.alert(
      'Connection succeeded',
      `${device.name} successfully connected`,
    );
  };

  const onConnectError = (error: string) => {
    console.log(
      `Device with deviceId(${device.deviceId}) failed to connect: `,
      error,
    );
    Alert.alert(
      'Connection failed',
      `${device.name} failed to connect: ${error}`,
    );
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
