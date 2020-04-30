package com.applicaster.adobe.login.webview;

import android.content.Context;
import android.os.Build;
import android.text.TextUtils;
import android.util.Log;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.adobe.adobepass.accessenabler.api.AccessEnabler;
import com.applicaster.adobe.login.AccessEnablerHandler;
import com.applicaster.adobe.login.pluginconfig.PluginDataRepository;
import com.applicaster.adobe.login.R;
import com.applicaster.adobe.login.pluginconfig.model.PluginConfig;

class AuthWebViewClient extends WebViewClient {

    String redirectUriScheme = AccessEnabler.ADOBEPASS_REDIRECT_URL_SCHEME + "://";
    String logoutPath = AccessEnabler.SP_URL_PATH_LOGOUT;
    private String redirectUri;
    private ActionCallback actionCallback;

    AuthWebViewClient(Context context, ActionCallback callback) {
        this.actionCallback = callback;
        this.redirectUri = getRedirectUri(context);
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        return checkOverride(view, url);
    }

    @SuppressWarnings("deprecation")
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, String url) {
        return checkOverride(view, url);
    }

    private boolean checkOverride(@NonNull WebView view, @NonNull String url) {
        if (url.equals(redirectUri)) {
            AccessEnablerHandler.INSTANCE.getAccessEnabler().getAuthenticationToken();
        } else if (url.equals(getLogoutUri())){
            AccessEnablerHandler.INSTANCE.getAccessEnabler().checkAuthentication();
        } else {
            view.loadUrl(url);
            return false;
        }
        actionCallback.onFinished();
        return true;
    }

    private String getRedirectUri(Context context) {
        PluginConfig config = PluginDataRepository.INSTANCE.getPluginConfig();
        String redirectUri = config.getRedirectUri();
        if (!TextUtils.isEmpty(redirectUri)) {
            return redirectUriScheme + redirectUri;
        } else
            return redirectUriScheme + context.getResources().getString(R.string.redirect_uri);
    }

    private String getLogoutUri() {
        return redirectUri + logoutPath;
    }
}

