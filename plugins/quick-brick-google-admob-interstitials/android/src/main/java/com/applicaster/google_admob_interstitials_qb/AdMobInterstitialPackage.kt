package com.applicaster.google_admob_interstitials_qb

import android.view.View
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class AdMobInterstitialPackage : ReactPackage {
	override fun createNativeModules(reactContext: ReactApplicationContext)
			: MutableList<NativeModule> = mutableListOf(AdMobInterstitialContract(reactContext))

	override fun createViewManagers(reactContext: ReactApplicationContext)
			: MutableList<ViewManager<View, ReactShadowNode<*>>> = mutableListOf()
}
