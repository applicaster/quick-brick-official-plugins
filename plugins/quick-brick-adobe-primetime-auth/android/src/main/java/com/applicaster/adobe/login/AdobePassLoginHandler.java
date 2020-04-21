package com.applicaster.adobe.login;

import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.util.Log;

import com.adobe.adobepass.accessenabler.api.AccessEnabler;
import com.adobe.adobepass.accessenabler.api.AccessEnablerException;
import com.adobe.adobepass.accessenabler.models.Mvpd;
import com.applicaster.adobe.login.pluginconfig.PluginRepository;
import com.applicaster.adobe.login.util.LocalStorageHelper;
import com.applicaster.adobe.login.webview.LoginProviderActivity;
import com.applicaster.adobe.login.webview.LogoutProvider;
import com.applicaster.app.CustomApplication;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

import androidx.appcompat.app.AlertDialog;

class AdobePassLoginHandler {

    public interface MessageHandler {
        void handle(Bundle bundle);
    }

    private final static String TAG = "AdobePass";

    private final PluginRepository pluginRepository;
    private final AccessEnablerHandler accessEnablerHandler;
    private final AccessEnablerDelegate delegate;
    private final ReactSession reactSession;

    private Context context;

    private MessageHandler[] messageHandlers = new MessageHandler[] {
            new MessageHandler() { public void handle(Bundle bundle) { handleSetRequestor(bundle); } },             //  0 SET_REQUESTOR_COMPLETE
            new MessageHandler() { public void handle(Bundle bundle) { handleSetAuthnStatus(bundle); } },           //  1 SET_AUTHN_STATUS
            new MessageHandler() { public void handle(Bundle bundle) { handleSetToken(bundle); } },                 //  2 SET_TOKEN
            new MessageHandler() { public void handle(Bundle bundle) { handleTokenRequestFailed(bundle); } },    //  3 TOKEN_REQUEST_FAILED
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },         //  4 SELECTED_PROVIDER
            new MessageHandler() { public void handle(Bundle bundle) { handleMVPDs(bundle); } },    //  5 DISPLAY_PROVIDER_DIALOG
            new MessageHandler() { public void handle(Bundle bundle) { handleNavigateToUrl(bundle); } },            //  6 NAVIGATE_TO_URL
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },         //  7 SEND_TRACKING_DATA
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },        //  8 SET_METADATA_STATUS
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },   //  9 PREAUTHORIZED_RESOURCES
    };

    AdobePassLoginHandler(Context context,
                          PluginRepository pluginRepository,
                          AccessEnablerHandler accessEnablerHandler,
                          ReactSession reactSession) {
        this.context = context;
        this.pluginRepository = pluginRepository;
        this.accessEnablerHandler = accessEnablerHandler;
        this.reactSession = reactSession;
        this.delegate = new AccessEnablerDelegate(new IncomingHandler(messageHandlers));
    }

    void initializeAccessEnabler() {
        AccessEnabler accessEnabler = null;
        try {
            // get a reference to the AccessEnabler instance
            // AccessEnabler can set softwareStatement and redirectUrl
            // if values for softwareStatement or redirect url are set in strings.xml, use null
            accessEnabler = AccessEnabler.Factory.getInstance(CustomApplication.getAppContext(),
                    pluginRepository.getPluginConfig().getBaseUrl(),
                    pluginRepository.getPluginConfig().getSoftwareStatement(),
                    pluginRepository.getPluginConfig().getRedirectUri());
        } catch (AccessEnablerException e) {
            Log.d(TAG, "Failed to initialize the AccessEnabler library. " + e.getMessage());
        }

        // configure the AccessEnabler library
        if (accessEnabler != null) {
            // set the delegate for the AccessEnabler
            accessEnabler.setDelegate(delegate);

            // Warning: this method should be invoked for testing/development purpose only.
            // The production app SHOULD use only HTTPS (this is the default value).
            accessEnabler.useHttps(true);

            accessEnablerHandler.setAccessEnabler(accessEnabler);
            accessEnablerHandler.setRequestor(pluginRepository.getPluginConfig().getBaseUrl(),
                    pluginRepository.getPluginConfig().getRequestorID());
        } else {
            Log.d(TAG, "Failed to configure the AccessEnabler library. ");
            // finish();
        }
    }

    void login(String itemTitle, String itemId, Callback callback) {
        accessEnablerHandler.setItemData(itemTitle, itemId);
        accessEnablerHandler.checkAuthentication();
        reactSession.setReactAuthCallback(callback);
    }

    private void handleSetRequestor(Bundle bundle) {
        // extract the status of the setRequestor() API call
        int status = bundle.getInt("status");

        switch (status) {
            case (AccessEnabler.ACCESS_ENABLER_STATUS_SUCCESS): {
                Log.d(TAG, "Config phase: SUCCESS");
            }
            break;
            case (AccessEnabler.ACCESS_ENABLER_STATUS_ERROR): {
                Log.d(TAG, "Config phase: FAILED");
                //TODO - Show error message to the user
            }
            break;
            default: {
                Log.d(TAG, "setAuthnStatus(): Unknown status code.");
                throw new RuntimeException("setRequestor(): Unknown status code.");
            }
        }
    }

    private void handleSetAuthnStatus(Bundle bundle) {
        // extract the status code
        int status = bundle.getInt("status");
        String errCode = bundle.getString("err_code");

        switch (status) {
            case (AccessEnabler.ACCESS_ENABLER_STATUS_SUCCESS): {
                Log.d(TAG, "Authentication success");
                LocalStorageHelper.setDefaultToken();
                accessEnablerHandler.getAuthorization();
            }
            break;
            case (AccessEnabler.ACCESS_ENABLER_STATUS_ERROR): {
                Log.d(TAG, "Authentication failed: " + errCode);
                if (errCode != null
                        && !errCode.isEmpty()
                        && errCode.equals(AccessEnabler.USER_NOT_AUTHENTICATED_ERROR)
                        && accessEnablerHandler.getFlow() == Flow.LOGOUT) {
                    LocalStorageHelper.setEmptyToken();
                    accessEnablerHandler.setFlow(Flow.UNDEFINED);
                    reactSession.triggerCallbackSuccess(new WritableNativeMap());
                    Log.d(TAG, "User was successfully logged out");
                } else {
                    accessEnablerHandler.getAuthentication();
                }
            }
            break;
            default: {
                Log.d(TAG, "setAuthnStatus(): Unknown status code.");
                throw new RuntimeException("setAuthnStatus(): Unknown status code.");
            }
        }
    }

    private void handleSetToken(Bundle bundle) {
        String resourceId = bundle.getString("resource_id");
        String token = bundle.getString("token");
        Log.d(TAG, "Token: " + token + "resId" + resourceId);
        accessEnablerHandler.setFlow(Flow.UNDEFINED);

        LocalStorageHelper.setToken(token);
        reactSession.triggerCallbackSuccess(new WritableNativeMap());
    }

    private void noOps(Bundle bundle) {
        //no-ops
        Log.d(this.getClass().getSimpleName(), "noOps()");
    }

    private void handleTokenRequestFailed(Bundle bundle) {
        if (context != null) {
            AlertDialog.Builder builder = new AlertDialog.Builder(context);
            builder.setTitle("Error");
            builder.setMessage(bundle.getString("err_description"));
            builder.setPositiveButton("OK", new DialogInterface.OnClickListener() {
                @Override
                public void onClick(DialogInterface dialogInterface, int i) {
                    dialogInterface.dismiss();
                }
            });
            builder.show();
        }
        reactSession.triggerCallbackFail();
    }

    private void handleNavigateToUrl(Bundle bundle) {
        final String url = bundle.getString("url");
        if (context != null && url != null && !url.isEmpty()) {
            switch (accessEnablerHandler.getFlow()) {
                case LOGIN:
                    Intent intent = new Intent(context, LoginProviderActivity.class);
                    intent.putExtra("url", url);
                    context.startActivity(intent);
                    break;
                case LOGOUT:
                    new Handler(Looper.getMainLooper()).post(
                            new Runnable() {
                                @Override
                                public void run() {
                                    LogoutProvider logoutProvider = new LogoutProvider();
                                    logoutProvider.startLogout(context, url);
                                }
                            }
                    );
                    break;
                default:
                    break;
            }
        }
    }

    private void handleMVPDs(Bundle bundle) {
        List<Mvpd> mvpds = new ArrayList<>();
        try {
            mvpds = (ArrayList<Mvpd>) bundle.getSerializable("mvpds");
        } catch (Exception e) {
            Log.e(TAG, "Failed to deserialize MVPDs");
        }
        WritableArray payload = Arguments.createArray();
        for (Mvpd mvpd : mvpds) {
            WritableMap map = new WritableNativeMap();
            map.putString("id", mvpd.getId());
            map.putString("title", mvpd.getDisplayName());
            map.putString("logoURL", mvpd.getLogoUrl());
            payload.pushMap(map);
        }
        reactSession.emitReactEvent("showProvidersList", payload);
    }

    private static class IncomingHandler extends Handler {
        private final WeakReference<MessageHandler[]> messageHandlers;

        IncomingHandler(MessageHandler[] messageHandlers) {
            this.messageHandlers = new WeakReference<>(messageHandlers);
        }

        @Override
        public void handleMessage(Message msg) {
            Bundle bundle = msg.getData();
            int opCode = bundle.getInt("op_code");
            MessageHandler[] messageHandlers = this.messageHandlers.get();
            if (messageHandlers != null && opCode < messageHandlers.length) {
                messageHandlers[opCode].handle(bundle);
            }
        }
    }
}