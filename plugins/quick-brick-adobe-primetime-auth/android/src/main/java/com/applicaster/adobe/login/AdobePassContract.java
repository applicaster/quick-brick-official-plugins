package com.applicaster.adobe.login;

import android.util.Log;

import com.applicaster.adobe.login.pluginconfig.mapper.PluginDataMapper;
import com.applicaster.adobe.login.pluginconfig.PluginDataRepository;
import com.applicaster.adobe.login.pluginconfig.PluginRepository;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import javax.annotation.Nonnull;

public class AdobePassContract extends ReactContextBaseJavaModule {
    private static final String TAG = "AdobePassContract";

    private AdobePassLoginHandler adobePassLoginHandler;
    private PluginRepository pluginRepository;
    private AccessEnablerHandler accessEnablerHandler;
    private ReactSession reactSession;

    public AdobePassContract(@Nonnull ReactApplicationContext context) {
        super(context);
        reactSession = ReactSession.INSTANCE;
        reactSession.setReactContext(context);
    }

    @Nonnull
    @Override
    public String getName() {
        return "AdobePassContract";
    }

    @ReactMethod
    public void setupAccessEnabler(ReadableMap pluginConfig) {
        Log.d(TAG, "Call from RN: setupAccessEnabler " + pluginConfig);
        createHandlers();
        setPluginConfigurationParams(pluginConfig);
        if (getCurrentActivity() != null) {
            getCurrentActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    adobePassLoginHandler.initializeAccessEnabler();
                }
            });
        }
    }

    private void createHandlers() {
        pluginRepository = PluginDataRepository.INSTANCE;
        accessEnablerHandler = AccessEnablerHandler.INSTANCE;
        adobePassLoginHandler = new AdobePassLoginHandler(getCurrentActivity(),
                pluginRepository,
                accessEnablerHandler,
                reactSession);
    }

    private void setPluginConfigurationParams(ReadableMap params) {
        PluginDataMapper dataMapper = new PluginDataMapper();
        pluginRepository.setPluginConfiguration(dataMapper.mapParamsToConfig(params));
    }

    @ReactMethod
    public void startLoginFlow(ReadableMap additionalConfig, final Callback rnCallback) {
        Log.d(TAG, "Call from RN: startLoginFlow" + additionalConfig);
        final String itemTitle = additionalConfig.getString("itemTitle");
        final String itemID = additionalConfig.getString("itemID");
        if (getCurrentActivity() != null) {
            getCurrentActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    accessEnablerHandler.setFlow(Flow.LOGIN);
                    adobePassLoginHandler.login(itemTitle,
                            itemID,
                            rnCallback);
                }
            });
        }
    }

    @ReactMethod
    public void setProviderID(String providerID) {
        Log.d(TAG, "Call from RN: setProviderID " + providerID);
        accessEnablerHandler.getAccessEnabler().setSelectedProvider(providerID);
    }

    @ReactMethod
    public void logout(final Callback rnCallback) {
        Log.d(TAG, "Call from RN: logout");
        accessEnablerHandler.setFlow(Flow.LOGOUT);
        accessEnablerHandler.logout(rnCallback);
    }
}
