import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {DeviceContext} from '../context/DeviceContext';
import DevicePairButton from './DevicePairButton';

const DeviceList = () => {
  const {devices, isSearching} = useContext(DeviceContext);

  return (
    <>
      {!isSearching && (
        <View style={styles.container}>
          <Text style={styles.title}>
            {devices.length > 0
              ? 'Select a device to pair'
              : 'No devices found'}
          </Text>
          {devices.map(device => (
            <DevicePairButton device={device} />
          ))}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
  },
});

export default DeviceList;
