/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect} from 'react';
import {NativeModules} from 'react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
  StyleSheet,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import DeviceSearchButton from './src/components/DeviceSearchButton';
import {
  checkMultiple,
  Permission,
  PERMISSIONS,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';
import DeviceList from './src/components/DeviceList';
import DeviceContextProvider from './src/context/DeviceContext';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const {AlfredLibraryModule} = NativeModules;

  useEffect(() => {
    AlfredLibraryModule.init(
      process.env.ALFRED_MODULE_ACCESS_KEY,
      process.env.ALFRED_MODULE_SECRET_KEY,
    )
      .then(data => {
        console.log(data);
        signIn('grata', process.env.ALFRED_MODULE_ALLY_CODE ?? '');
      })
      .catch(err => console.log(err));
  });

  const signIn = (allyName: string, allyCode: string) => {
    AlfredLibraryModule.sdkSignIn(allyName, allyCode)
      .then(data => {
        console.log(data);
        handlePermissions();
      })
      .catch(err => console.log(err));
  };

  const handlePermissions = () => {
    checkMultiple([
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ]).then(statuses => {
      console.log(statuses);

      const requestableStatuses = Object.keys(statuses).filter(status => {
        return !(
          statuses[status] === RESULTS.UNAVAILABLE ||
          statuses[status] === RESULTS.GRANTED
        );
      });

      if (requestableStatuses.length > 0) {
        requestMultiple(requestableStatuses as Permission[]).then(results =>
          console.log(results),
        );
      }
    });
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <DeviceContextProvider>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.container}
          style={backgroundStyle}>
          <View style={{...backgroundStyle, ...styles.innerContainer}}>
            <DeviceSearchButton />
            <DeviceList />
          </View>
        </ScrollView>
      </DeviceContextProvider>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  innerContainer: {
    borderWidth: 1,
    height: '70%',
  },
});

export default App;
