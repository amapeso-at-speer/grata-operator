import React, {useState} from 'react';

interface DeviceContextType {
  isSearching: boolean;
  setIsSearching: (isSearching: boolean) => void;
  devices: any[];
  setDevices: (deviceList: any[]) => void;
}

const defaultDeviceContext = {
  isSearching: false,
  setIsSearching: () => {},
  devices: [] as any[],
  setDevices: () => {},
};

export const DeviceContext =
  React.createContext<DeviceContextType>(defaultDeviceContext);

const DeviceContextProvider = ({children}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);

  return (
    <DeviceContext.Provider
      value={{
        isSearching,
        setIsSearching,
        devices,
        setDevices,
      }}>
      {children}
    </DeviceContext.Provider>
  );
};

export default DeviceContextProvider;
