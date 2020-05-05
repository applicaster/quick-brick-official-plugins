package com.applicaster.adobe.login;

import android.util.Log;

import com.adobe.adobepass.accessenabler.api.AccessEnabler;
import com.applicaster.adobe.login.pluginconfig.PluginDataRepository;
import com.facebook.react.bridge.Callback;

import java.util.ArrayList;

public enum AccessEnablerHandler {
    INSTANCE;

    private AccessEnabler accessEnabler;
    private Flow flow = Flow.UNDEFINED;

    String resourceId;
    String itemTitle;
    String itemId;

    public AccessEnabler getAccessEnabler() {
        return accessEnabler;
    }

    public void setAccessEnabler(AccessEnabler accessEnabler) {
        this.accessEnabler = accessEnabler;
    }

    public void setRequestor(String baseUrl, String requestorId) {
        if (accessEnabler != null) {
            if (!"".equals(requestorId)) {
                // request configuration data
                ArrayList<String> spUrls = new ArrayList<String>();
                spUrls.add(baseUrl);
                accessEnabler.setRequestor(PluginDataRepository.INSTANCE.getPluginConfig().getRequestorID(), spUrls);
            } else {
                Log.d("AdobePass", "Enter a valid requestor id.");
            }
        }
    }

    public void setItemData(String itemTitle, String itemId) {
        this.resourceId = PluginDataRepository.INSTANCE.getPluginConfig().getResourceID();
        this.itemTitle = itemTitle;
        this.itemId = itemId;
    }

    public void checkAuthentication() {
        if (accessEnabler != null) {
            accessEnabler.checkAuthentication();
        }
    }

    public void getAuthentication() {
        if (accessEnabler != null) {
            accessEnabler.getAuthentication();
        }
    }

    public void checkAuthorization() {
        if (accessEnabler != null) {
            accessEnabler.checkAuthorization(getResourceId(resourceId, itemTitle, itemId));
        }
    }

    public void getAuthorization() {
        if (accessEnabler != null) {
            accessEnabler.getAuthorization(getResourceId(resourceId, itemTitle, itemId));
        }
    }

    private String getResourceId(String resourceId, String itemTitle, String itemId) {
        return String.format("<rss version=\"2.0\" xmlns:media=\"http://search.yahoo.com/mrss/\">" +
                "<channel><title>%s</title><item><title>%s</title><guid>%s" +
                "</guid></item></channel></rss>", resourceId, itemTitle, itemId);
    }

    public void logout(Callback callback) {
        if (accessEnabler != null) {
            ReactSession.INSTANCE.setReactAuthCallback(callback);
            accessEnabler.logout();
        }
    }

    public Flow getFlow() {
        return flow;
    }

    public void setFlow(Flow flow) {
        this.flow = flow;
    }
}
