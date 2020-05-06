package com.applicaster.adobe.login.webview;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import android.widget.ProgressBar;

import com.applicaster.adobe.login.R;
import com.applicaster.adobe.login.ReactSession;
import com.facebook.react.bridge.WritableNativeMap;

public class LoginProviderActivity extends AppCompatActivity implements ActionCallback {

    private static final String ARG_URL = "url";

    private String url;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login_provider);

        if (getIntent() != null) {
            this.url = getIntent().getStringExtra(ARG_URL);
        }

        WebView webView = findViewById(R.id.web_view_login);
        ProgressBar pbLoadingProgress = findViewById(R.id.web_view_loading_progress);

        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new AuthWebViewClient(this, this));
        webView.setWebChromeClient(new LoginWebChromeClient(pbLoadingProgress));
        webView.loadUrl(url);
    }

    @Override
    public void onFinished() {
        Log.i(this.getClass().getSimpleName(), "Login action performed on WebView");
        finish();
    }

    @Override
    public void onBackPressed() {
        super.onBackPressed();
        ReactSession.INSTANCE.triggerCallbackFail(new WritableNativeMap());
    }
}
