package com.grata_operator;
import android.util.Log;

import androidx.annotation.NonNull;

import com.alfred.library.AlfredDeviceBinder;
import com.alfred.library.AlfredDeviceManager;
import com.alfred.library.ILockBinder;
import com.alfred.library.ILockConnecter;
import com.alfred.library.ILockManager;
import com.alfred.library.ILockScanner;
import com.alfred.library.model.AlfredBinderDevice;
import com.alfred.library.model.AlfredBleDevice;
import com.alfred.library.model.AlfredError;
import com.alfred.library.model.AlfredLock;
import com.alfred.library.model.AlfredLockAccessData;
import com.alfred.library.model.AlfredLockRecord;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.alfred.library.AlfredLibrary;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;

public class AlfredLibraryModule extends ReactContextBaseJavaModule implements ILockScanner.IListener, ILockBinder.IListener, ILockConnecter.IConnectCallback, ILockConnecter.INotifyCallback {
    private final ReactApplicationContext context;
    private List<AlfredBleDevice> devices;

    AlfredLibraryModule(ReactApplicationContext context) {
        super(context);
        this.context = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "AlfredLibraryModule";
    }

    @ReactMethod
    public void createCalendarEvent(String name, String location) {
        Log.d("AlfredLibraryModule", "Create event called with the name: " + name + " and location: " + location);
    }

    @ReactMethod
    public void init(String accessKey, String secretKey, Promise promise) {
        AlfredLibrary.init(context, accessKey, secretKey, new AlfredLibrary.ICallback() {
            @Override
            public void onSuccess() {
                Log.d("AlfredLibraryModule", "Successfully initialized");
                promise.resolve("AlfredLibrary successfully initialized");
            }

            @Override
            public void onFailed(AlfredError alfredError, String s) {
                Log.d("AlfredLibraryModule", "Could not be initialized: " + alfredError.toDescription());
                promise.reject(new Throwable("AlfredLibrary failed to initialize: " + alfredError.toDescription()));
            }
        });
    }

    @ReactMethod
    public void sdkSignIn(String allyName, String allyCode, Promise promise) {
        AlfredLibrary.register(allyName, allyCode, new AlfredLibrary.ICallback() {
            @Override
            public void onSuccess() {
                Log.d("AlfredLibraryModule", "Successfully signed in: " + allyName);
                promise.resolve("AlfredLibrary successfully signed in: " + allyName);
            }

            @Override
            public void onFailed(AlfredError alfredError, String s) {
                Log.d("AlfredLibraryModule", "Could not sign in: " + alfredError.toDescription());
                promise.reject(new Throwable("AlfredLibrary failed to sign in: " + alfredError.toDescription()));
            }
        });
    }

    /** Scanning for Lock Methods **/
    @ReactMethod
    public void searchForLocks() {
        ILockScanner scanner = AlfredDeviceBinder.buildScanner(context, this);
        scanner.scan();
    }

    @Override
    public void onScanSuccess(List<AlfredBleDevice> list) {
        devices = list;
        JSONArray devices = new JSONArray();

        if (!list.isEmpty()) {
            Log.d("AlfredLibraryModule", "Devices found: " + list.toString());

            for (int i = 0; i < list.size(); i++) {
                JSONObject device = new JSONObject();
                try {
                    AlfredBleDevice alfredDevice = list.get(i);
                    device.put("name", alfredDevice.getName());
                    device.put("masterId", alfredDevice.getMasterID());
                    device.put("deviceId", alfredDevice.getDeviceID());
                    device.put("isPairable", alfredDevice.isPairable());
                    devices.put(device);
                } catch (JSONException e) {
                    Log.d("AlfredLibraryModule", "Error while converting device data to JSON: " + e.getMessage());
                }
            }
        } else {
            Log.d("AlfredLibraryModule", "No devices found " + list.toString());
        }

        // Test data
        JSONObject test = new JSONObject();
        try {
            test.put("name", "Alfred Lock 1");
            test.put("masterId", "1234567");
            test.put("deviceId", "8912345");
            test.put("isPairable", true);
            devices.put(test);
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicesSearch", devices.toString());
    }

    @Override
    public void onScanError(AlfredError alfredError) {
        Log.d("AlfredLibraryModule", "Error while searching for devices: " + alfredError.toDescription());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicesSearchError", alfredError.toDescription());
    }

    /** Registering Lock Methods **/
    @ReactMethod
    public void bindToLock(String masterId) {
        Log.d("AlfredLibraryModule", "Attempting to bind to lock: " + masterId);
        AlfredBleDevice selectedDevice = null;

        for (int i = 0; i < devices.size(); i++) {
            AlfredBleDevice current = devices.get(i);
            if (Objects.equals(current.getMasterID(), masterId)) {
                selectedDevice = current;
            }
        }

        if (selectedDevice != null) {
            ILockBinder binder = AlfredDeviceBinder.buildLock(context, selectedDevice, this);
            binder.register(masterId);
        } else {
            Log.d("AlfredLibraryModule", "Could not find lock: " + masterId);
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceNotFound", "Could not find device: " + masterId);
        }
    }

    @Override
    public void onRegisterSuccess(AlfredBinderDevice alfredBinderDevice, AlfredLockAccessData alfredLockAccessData) {
        // register success
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicePair", "Pair succeeded");
    }

    @Override
    public void onRegisterError(String s, AlfredError alfredError) {
        // register error
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicePairError", "Pair failed: " + alfredError.toDescription());
    }

    /** Access to Lock methods **/
    @ReactMethod
    public void connectLock(String deviceId) {
        Log.d("AlfredModule", "Attempting to connect to lock: " + deviceId);

        AlfredBleDevice selectedDevice = null;

        for (int i = 0; i < devices.size(); i++) {
            AlfredBleDevice current = devices.get(i);
            if (Objects.equals(current.getDeviceID(), deviceId)) {
                selectedDevice = current;
            }
        }

        if (selectedDevice != null) {
            ILockManager manager = AlfredDeviceManager.buildLock(deviceId, this, this);
            manager.access();
        } else {
            Log.d("AlfredLibraryModule", "Could not find lock: " + deviceId);
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceNotFound", "Could not find device: " + deviceId);
        }
    }

    @Override
    public void onConnected(AlfredLock alfredLock) {
        Log.d("AlfredLibraryModule", "Connected to device: " + alfredLock.getDeviceID());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceConnect", "Successfully connected to device");
    }

    @Override
    public void onConnectedUpdateMode(AlfredLock alfredLock) {
        Log.d("AlfredLibraryModule", "Connected (update mode) to device: " + alfredLock.getDeviceID());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceConnect", "Successfully connected to device");
    }

    @Override
    public void onConnectFailed(AlfredLock alfredLock, AlfredError alfredError) {
        Log.d("AlfredLibraryModule", "Failed to connect to device: (" + alfredLock.getDeviceID() + ") with error: " + alfredError.toDescription());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceConnectError", "Failed to connect to device: " + alfredError.toDescription());
    }

    @Override
    public void onDisconnected(AlfredLock alfredLock) {
        Log.d("AlfredLibraryModule", "Disconnected from device: " + alfredLock.getDeviceID());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceDisconnect", "Disconnected from device: " + alfredLock.getDeviceID());
    }

    @Override
    public void onRecived(AlfredLock alfredLock, AlfredLockRecord alfredLockRecord) {
        Log.d("AlfredLibraryModule", "On Connect Received: " + alfredLock.getDeviceID());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDeviceConnectReceived", "Received connection: " + alfredLock.getDeviceID());
    }
}
