package com.applicaster.adobe.login.util;

import com.applicaster.storage.LocalStorage;

import javax.annotation.Nullable;

public class LocalStorageHelper {

    public static final String KEY_TOKEN = "idToken";
    private static final String EMPTY_OBJECT_STR = "\"{}\"";
    private static final String DEFAULT_TOKEN_STR = "authToken";

    public static void setEmptyToken() {
        LocalStorage.INSTANCE.set(KEY_TOKEN, EMPTY_OBJECT_STR);
    }

    public static void setDefaultToken() {
        LocalStorage.INSTANCE.set(KEY_TOKEN, DEFAULT_TOKEN_STR);
    }

    public static void setToken(@Nullable String token) {
        if (token != null) {
            LocalStorage.INSTANCE.set(KEY_TOKEN, token);
        }
    }

}
