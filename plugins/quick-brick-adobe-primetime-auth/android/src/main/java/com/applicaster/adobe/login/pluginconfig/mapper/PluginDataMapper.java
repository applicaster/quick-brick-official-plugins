package com.applicaster.adobe.login.pluginconfig.mapper;

import com.applicaster.adobe.login.pluginconfig.model.PluginConfig;
import com.facebook.react.bridge.ReadableMap;

public class PluginDataMapper {
    public PluginConfig mapParamsToConfig(ReadableMap params) {
        String baseUrl = getOrEmpty(params, "base_url_android");
        String softwareStatement =  getOrEmpty(params, "software_statement");
        String requestorID = getOrEmpty(params, "requestor_id");
        String resourceID =  getOrEmpty(params, "resource_id");
        String redirectUri =  getOrEmpty(params, "deep_link");
        String authDefaultErrorMessage = getOrEmpty(params, "authorization_default_error_message");

        return new PluginConfig(baseUrl, softwareStatement, requestorID, resourceID, redirectUri, authDefaultErrorMessage);
    }

    private String getOrEmpty(ReadableMap params, String key) {
        if (params.hasKey(key)) {
            return params.getString(key);
        } else {
            return "";
        }
    }
}
