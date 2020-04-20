package com.applicaster.google_admob_interstitials_qb

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.google.android.gms.ads.InterstitialAd
import com.google.android.gms.ads.MobileAds

class AdMobInterstitialContract(private val context: ReactApplicationContext)
	: ReactContextBaseJavaModule(context) {

	init {
		MobileAds.initialize(context) {}
	}

	override fun getName(): String = this.javaClass.simpleName

	@ReactMethod
	fun initAd(pluginConfig: ReadableMap) {
		val interstitialAd = InterstitialAd(context).apply {
			adUnitId = pluginConfig.getString("adUnitId")
		}

	}

}
