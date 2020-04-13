package com.applicaster.adobe.login;


import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nullable;

public enum ReactSession {
    INSTANCE;

    private ReactApplicationContext reactContext;
    private @Nullable Callback reactAuthCallback;
    private @Nullable Callback reactLogoutCallback;

    public void setReactContext(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
    }

    public void setReactAuthCallback(@Nullable Callback reactAuthCallback) {
        this.reactAuthCallback = reactAuthCallback;
    }

    public void setReactLogoutCallback(@Nullable Callback reactLogoutCallback) {
        this.reactLogoutCallback = reactLogoutCallback;
    }

    public void emitReactEvent(String eventName, WritableArray payload) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, payload);
    }

    public void triggerCallbackSuccess(WritableMap callbackArgs) {
        if (reactAuthCallback != null) {
            reactAuthCallback.invoke(callbackArgs);
            reactAuthCallback = null;
        }
    }

    public void triggerCallbackFail() {
        if (reactAuthCallback != null) {
            reactAuthCallback.invoke();
            reactAuthCallback = null;
        }
    }

    public void triggerLogoutSuccess() {
        if (reactLogoutCallback != null) {
            reactLogoutCallback.invoke();
            reactLogoutCallback = null;
        }
    }
}
