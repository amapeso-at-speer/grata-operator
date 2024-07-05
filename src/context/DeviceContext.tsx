import React, {useState} from 'react';
import {LockDevice} from '../types/LockDevice';

interface DeviceContextType {
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  devices: LockDevice[];
  setDevices: (deviceList: any[]) => void;
  connectedDevice: LockDevice | null;
  setConnectedDevice: (device: LockDevice) => void;
}

const defaultDeviceContext = {
  isSearching: false,
  setIsSearching: () => {},
  devices: [],
  setDevices: () => {},
  connectedDevice: null,
  setConnectedDevice: () => {},
};

export const DeviceContext =
  React.createContext<DeviceContextType>(defaultDeviceContext);

const DeviceContextProvider = ({children}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [devices, setDevices] = useState<LockDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<LockDevice | null>(
    null,
  );

  return (
    <DeviceContext.Provider
      value={{
        isSearching,
        setIsSearching,
        devices,
        setDevices,
        connectedDevice,
        setConnectedDevice,
      }}>
      {children}
    </DeviceContext.Provider>
  );
};

export default DeviceContextProvider;
