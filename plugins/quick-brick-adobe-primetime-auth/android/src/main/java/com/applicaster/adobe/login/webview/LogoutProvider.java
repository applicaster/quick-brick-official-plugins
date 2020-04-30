package com.applicaster.adobe.login.webview;

import android.content.Context;
import android.util.Log;
import android.webkit.WebView;

import androidx.annotation.MainThread;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

public class LogoutProvider implements ActionCallback {

    @MainThread
    public void startLogout(@NonNull Context context, @Nullable String url) {
        if (url != null && !url.isEmpty()) {
            WebView logoutWebView = new WebView(context);
            logoutWebView.getSettings().setJavaScriptEnabled(true);
            logoutWebView.setWebViewClient(new AuthWebViewClient(context, this));
            logoutWebView.loadUrl(url);
        }
    }

    @Override
    public void onFinished() {
        Log.i(this.getClass().getName(), "Logout action performed on WebView");
    }
}

