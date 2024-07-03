import React, {useEffect} from 'react';
import {NativeModules, Button} from 'react-native';

const NewModuleButton = () => {
  const {AlfredLibraryModule} = NativeModules;
  useEffect(() => {
    AlfredLibraryModule.init(
      process.env.ALFRED_MODULE_ACCESS_KEY,
      process.env.ALFRED_MODULE_SECRET_KEY,
    )
      .then(data => console.log(data))
      .catch(err => console.log(err));
  });

  const onPress = () => {
    console.log('We will invoke the native module here!');
    AlfredLibraryModule.createCalendarEvent('testName', 'testLocation');
  };

  return (
    <Button
      title="Click to invoke your native module!"
      color="#841584"
      onPress={onPress}
    />
  );
};

export default NewModuleButton;
