package com.applicaster.adobe.login;

import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.adobe.adobepass.accessenabler.api.AccessEnabler;
import com.adobe.adobepass.accessenabler.api.AccessEnablerException;
import com.adobe.adobepass.accessenabler.utils.Utils;
import com.applicaster.adobe.login.model.PluginConfig;
import com.applicaster.app.CustomApplication;
import com.applicaster.plugin_manager.login.LoginContract;
import com.applicaster.plugin_manager.playersmanager.Playable;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.lang.ref.WeakReference;
import java.util.ArrayList;
import java.util.List;

import androidx.appcompat.app.AlertDialog;

public class AdobePassLoginHandler {

    public interface MessageHandler {
        void handle(Bundle bundle);
    }

    private final static String LOG_TAG = "AdobePass";

    private final PluginRepository pluginRepository;
    private final AccessEnablerHandler accessEnablerHandler;
    private ProgressDialog progressDialog;

    private AccessEnablerDelegate delegate;
    private LoginContract.Callback loginCallback;
    private Context context;

    private MessageHandler[] messageHandlers = new MessageHandler[] {
            new MessageHandler() { public void handle(Bundle bundle) { handleSetRequestor(bundle); } },             //  0 SET_REQUESTOR_COMPLETE
            new MessageHandler() { public void handle(Bundle bundle) { handleSetAuthnStatus(bundle); } },           //  1 SET_AUTHN_STATUS
            new MessageHandler() { public void handle(Bundle bundle) { handleSetToken(bundle); } },                 //  2 SET_TOKEN
            new MessageHandler() { public void handle(Bundle bundle) { handleTokenRequestFailed(bundle); } },    //  3 TOKEN_REQUEST_FAILED
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },         //  4 SELECTED_PROVIDER
            new MessageHandler() { public void handle(Bundle bundle) { handleDisplayProviderDialog(bundle); } },    //  5 DISPLAY_PROVIDER_DIALOG
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },            //  6 NAVIGATE_TO_URL
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },         //  7 SEND_TRACKING_DATA
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },        //  8 SET_METADATA_STATUS
            new MessageHandler() { public void handle(Bundle bundle) { noOps(bundle); } },   //  9 PREAUTHORIZED_RESOURCES
    };

    AdobePassLoginHandler(PluginRepository pluginRepository,
                          AccessEnablerHandler accessEnablerHandler) {
        this.pluginRepository = pluginRepository;
        this.accessEnablerHandler = accessEnablerHandler;
        this.delegate = new AccessEnablerDelegate(new IncomingHandler(messageHandlers), pluginRepository);
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
            Log.d("Adobepass", "Failed to initialize the AccessEnabler library. " + e.getMessage());
        }

        // configure the AccessEnabler library
        if (accessEnabler != null) {
            // set the delegate for the AccessEnabler
            accessEnabler.setDelegate(delegate);

            // Warning: this method should be invoked for testing/development purpose only.
            // The production app SHOULD use only HTTPS (this is the default value).
            accessEnabler.useHttps(true);

            accessEnablerHandler.setAccessEnabler(accessEnabler);
        } else {
            Log.d("Adobepass", "Failed to configure the AccessEnabler library. ");
            // finish();
        }
    }

    void login(Context context, Playable playable, LoginContract.Callback callback) {
        this.context = context;
        accessEnablerHandler.setRequestor(pluginRepository.getPluginConfig().getBaseUrl(),
                pluginRepository.getPluginConfig().getRequestorID(), getItemTitle(playable), getItemId(playable));
        accessEnablerHandler.checkAuthentication();
        loginCallback = callback;
    }

    private String getItemId(Playable playable) {
        if (playable != null) {
            return playable.getAnalyticsParams().get("Item ID");
        }

        return "";
    }

    private String getItemTitle(Playable playable) {
        if (playable != null) {
            return playable.getAnalyticsParams().get("Item Name");
        }

        return "";
    }

    void displayLogoutAlertDialog(Context context) {
//        AlertDialog.Builder builder;
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
//            builder = new AlertDialog.Builder(context, android.R.style.Theme_Material_Dialog_Alert);
//        } else {
//            builder = new AlertDialog.Builder(context);
//        }
//
//        PluginConfig pluginConfig = PluginDataRepository.INSTANCE.getPluginConfig();
//        builder.setTitle(pluginConfig.getLogoutDialogTitle())
//                .setMessage(pluginConfig.getLogoutDialogMessage())
//                .setPositiveButton(pluginConfig.getLogoutDialogPositiveButtonText(), new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int which) {
//                        accessEnablerHandler.logout();
//                    }
//                })
//                .setNegativeButton(pluginConfig.getLogoutDialogNegativeButtonText(), new DialogInterface.OnClickListener() {
//                    public void onClick(DialogInterface dialog, int which) {
//                        // do nothing
//                    }
//                })
//                .show();
    }


    private void hideLoadingDialog() {
//        if (progressDialog != null) {
//            progressDialog.dismiss();
//        }
    }

    private void handleSetRequestor(Bundle bundle) {
        // extract the status of the setRequestor() API call
        int status = bundle.getInt("status");

        switch (status) {
            case (AccessEnabler.ACCESS_ENABLER_STATUS_SUCCESS): {
                Log.d("AdobePass", "Config phase: SUCCESS");
            }
            break;
            case (AccessEnabler.ACCESS_ENABLER_STATUS_ERROR): {
                Log.d("AdobePass", "Config phase: FAILED");
                //TODO - Show error message to the user
            }
            break;
            default: {
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
                Log.d("Adobepass", "Authentication success");
                accessEnablerHandler.getAuthorization();
            }
            break;
            case (AccessEnabler.ACCESS_ENABLER_STATUS_ERROR): {
                Log.d("Adobepass", "Authentication failed: " + errCode);
                accessEnablerHandler.getAuthentication();
            }
            break;
            default: {
                throw new RuntimeException("setAuthnStatus(): Unknown status code.");
            }
        }
    }

    private void handleSetToken(Bundle bundle) {
//        // extract the token and resource ID
//        String resourceId = bundle.getString("resource_id");
//        String token = bundle.getString("token");
//
//        String error;
//        if (token == null || token.trim().length() == 0) {
//            error = "empty token";
//        } else {
//            try {
//                error = new MediaTokenValidatorTask().execute(pluginRepository.getPluginConfig().getTokenValidationUrl(), resourceId, token).get();
//            } catch (Exception e) {
//                Log.d(LOG_TAG, e.getMessage());
//                error = "token validation process interrupted";
//            }
//        }
//
//        if (error == null) {
            loginCallback.onResult(true);
//        } else {
//            Log.d(LOG_TAG, "Authorisation: FAILED\n\nFailed media token validation\n\nResource: " + resourceId + "\nError: " + error);
//        }
//
//        Log.d(LOG_TAG, resou
//        Log.d(LOG_TAG, "Token: " + token);rceId);
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

        loginCallback.onResult(false);
    }

    private void handleDisplayProviderDialog(Bundle bundle) {
//        navigator.goToMvpdPicker(CustomApplication.getAppContext());
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

            messageHandlers.get()[opCode].handle(bundle);
        }
    }
}