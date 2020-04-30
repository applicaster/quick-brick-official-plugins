package com.applicaster.adobe.login.pluginconfig.model;

public class PluginConfig {
    private final String baseUrl;
    private final String softwareStatement;
    private final String requestorID;
    private final String resourceID;
    private final String redirectUri;
    private final String authDefaultErrorMessage;


    public PluginConfig(String baseUrl,
                        String softwareStatement,
                        String requestorID,
                        String resourceID,
                        String redirectUri,
                        String authDefaultErrorMessage) {
        this.baseUrl = baseUrl;
        this.softwareStatement = softwareStatement;
        this.requestorID = requestorID;
        this.resourceID = resourceID;
        this.redirectUri = redirectUri;
        this.authDefaultErrorMessage = authDefaultErrorMessage;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getSoftwareStatement() {
        return softwareStatement;
    }

    public String getRequestorID() {
        return requestorID;
    }

    public String getResourceID() {
        return resourceID;
    }

    public String getRedirectUri() {
        return redirectUri;
    }

    public String getAuthDefaultErrorMessage() {
        return authDefaultErrorMessage;
    }
}
