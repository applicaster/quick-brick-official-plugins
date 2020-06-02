package com.applicaster.ima.ads

import android.net.Uri
import com.google.android.exoplayer2.C
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
	data class Vast(val cuePoints: MutableList<CuePoint>) : Ad()
	data class Vmap(val adTagUri: Uri) : Ad()
	object Empty: Ad()
}

sealed class AdType(val offset: Long = 0) {
	data class Preroll(val preOffset: Long = 0) : AdType(preOffset)
	data class Midroll(val midOffset: Long) : AdType(midOffset)
	data class Postroll(val postOffset: Long = C.TIME_END_OF_SOURCE) : AdType(postOffset)

	companion object {
		fun create(offset: String): AdType =
				when (offset) {
					KEY_OFFSET_PRE -> Preroll()
					KEY_OFFSET_POST -> Postroll()
					else -> Midroll(offset.toDouble().toLong())
				}
	}
}

data class CuePoint(val adType: AdType, val adTagUri: Uri)
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
			val quePoints = data.mapNotNull { ad ->  parseSingleAd(ad as? Map<*, *>?) }
			Ad.Vast(quePoints.toMutableList())
		}
		data is String && data.isNotEmpty() -> Ad.Vmap(Uri.parse(data.toString()))
		else -> null
	}

private fun parseSingleAd(ad: Map<*, *>?): CuePoint? {
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
			is AdType.Midroll -> CuePoint(type, Uri.parse(url))
			is AdType.Preroll -> CuePoint(type, Uri.parse(url))
			is AdType.Postroll -> CuePoint(type, Uri.parse(url))
		}
	}
}
//endregion
