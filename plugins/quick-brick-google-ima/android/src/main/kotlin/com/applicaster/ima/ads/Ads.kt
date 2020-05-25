package com.applicaster.ima.ads

import android.net.Uri
import com.google.android.exoplayer2.text.Cue

//region Constants
const val KEY_URL = "ad_url"
const val KEY_OFFSET = "offset"
const val KEY_EXTENSIONS = "extensions"
const val KEY_VIDEO_ADS = "video_ads"
const val KEY_OFFSET_PRE = "preroll"
const val KEY_OFFSET_POST = "postroll"
//endregion

//region DataTypes
sealed class Ad {
	data class Vast(val cuePoints: List<CuePoint>) : Ad()
	data class Vmap(val adTagUri: Uri) : Ad()
	object Empty: Ad()
}

sealed class AdType {
	object Preroll : AdType()
	data class Midroll(val offset: Long) : AdType()
	object Postroll : AdType()

	companion object {
		fun create(offset: String): AdType =
				when (offset) {
					KEY_OFFSET_PRE -> Preroll
					KEY_OFFSET_POST -> Postroll
					else -> Midroll(offset.toDouble().toLong())
				}
	}
}

enum class AdState {
	UNAVAILABLE,
	/** State for an ad that has a URL but has not yet been played.  */
	AVAILABLE,
	/** State for an ad that was skipped.  */
	SKIPPED,
	/** State for an ad that was played in full.  */
	PLAYED,
	/** State for an ad that could not be loaded.  */
	ERROR
}

data class CuePoint(val adState: AdState, val index: Int, val adType: AdType, val adTagUri: Uri) {
	fun withNewAdState(cuePoint: CuePoint, newAdState: AdState): CuePoint =
			CuePoint(newAdState, cuePoint.index, cuePoint.adType, cuePoint.adTagUri)
}
//endregion

//region Functions
fun parseAds(extensions: Map<String, Any?>): Ad {
	return extensions.takeIf { it.containsKey(KEY_EXTENSIONS) }
			?.get(KEY_EXTENSIONS)
			?.run { getVideoAdsData(this) }
			?.run { getAds(this) } ?: Ad.Empty
}

private fun getVideoAdsData(data: Any?): Any? =
	when {
		data is Map<*, *> && data.containsKey(KEY_VIDEO_ADS) -> data[KEY_VIDEO_ADS]
		else -> null
	}

private fun getAds(data: Any?): Ad? =
	 when {
		data is List<*> && !data.isNullOrEmpty() -> {
			val quePoints = data.mapIndexedNotNull { index, ad ->  parseSingleAd(ad as? Map<*, *>?, index) }
			Ad.Vast(quePoints)
		}
		data is String && data.isNotEmpty() -> Ad.Vmap(Uri.parse(data.toString()))
		else -> null
	}

private fun parseSingleAd(ad: Map<*, *>?, index: Int): CuePoint? {
	return ad?.let {
		var url = ""
		var offset = ""
		if (ad.containsKey(KEY_URL)) {
			url = ad[KEY_URL].toString()
		}
		if (ad.containsKey(KEY_OFFSET)) {
			offset = ad[KEY_OFFSET].toString()
		}
		return when (val type = AdType.create(offset)) {
			is AdType.Midroll -> CuePoint(AdState.UNAVAILABLE, index, type, Uri.parse(url))
			AdType.Preroll -> CuePoint(AdState.UNAVAILABLE, index, type, Uri.parse(url))
			AdType.Postroll -> CuePoint(AdState.UNAVAILABLE, index, type, Uri.parse(url))
		}
	}
}
//endregion
