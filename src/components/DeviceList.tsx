import React, {useContext} from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {DeviceContext} from '../context/DeviceContext';

const DeviceList = () => {
  const {devices} = useContext(DeviceContext);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {devices.length > 0 ? 'Select a device to pair' : 'No devices found'}
      </Text>
      {devices.map(device => (
        <TouchableOpacity>
          <Text>{device.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
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
