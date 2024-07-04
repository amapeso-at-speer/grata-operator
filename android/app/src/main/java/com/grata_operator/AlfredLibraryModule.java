package com.grata_operator;
import android.util.Log;

import androidx.annotation.NonNull;

import com.alfred.library.AlfredDeviceBinder;
import com.alfred.library.ILockScanner;
import com.alfred.library.model.AlfredBleDevice;
import com.alfred.library.model.AlfredError;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.alfred.library.AlfredLibrary;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.List;

public class AlfredLibraryModule extends ReactContextBaseJavaModule implements ILockScanner.IListener {
    private final ReactApplicationContext context;

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

    @ReactMethod
    public void searchForLocks() {
        ILockScanner scanner = AlfredDeviceBinder.buildScanner(context, this);
        scanner.scan();
    }

    @Override
    public void onScanSuccess(List<AlfredBleDevice> list) {
        if (!list.isEmpty()) {
            Log.d("AlfredLibraryModule", "Devices found: " + list.toString());
        } else {
            Log.d("AlfredLibraryModule", "No devices found " + list.toString());
        }

        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicesSearch", list.toString());
    }

    @Override
    public void onScanError(AlfredError alfredError) {
        Log.d("AlfredLibraryModule", "Error while searching for devices: " + alfredError.toDescription());
        context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("onDevicesSearchError", alfredError.toDescription());
    }
}
