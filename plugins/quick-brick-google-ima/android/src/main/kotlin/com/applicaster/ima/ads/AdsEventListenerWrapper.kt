package com.applicaster.ima.ads

import com.google.ads.interactivemedia.v3.api.AdEvent

class AdsEventListenerWrapper : AdEvent.AdEventListener {

	override fun onAdEvent(event: AdEvent?) {
		val eventType: AdEvent.AdEventType? = event?.type //event types
		val ad = event?.ad //current Ad item
		val adData = event?.adData //current Ad item data

		when (eventType) {
			AdEvent.AdEventType.ALL_ADS_COMPLETED -> Unit
			AdEvent.AdEventType.CLICKED -> Unit
			AdEvent.AdEventType.COMPLETED -> Unit
			AdEvent.AdEventType.CUEPOINTS_CHANGED -> Unit
			AdEvent.AdEventType.CONTENT_PAUSE_REQUESTED -> Unit
			AdEvent.AdEventType.CONTENT_RESUME_REQUESTED -> Unit
			AdEvent.AdEventType.FIRST_QUARTILE -> Unit
			AdEvent.AdEventType.LOG -> Unit
			AdEvent.AdEventType.AD_BREAK_READY -> Unit
			AdEvent.AdEventType.MIDPOINT -> Unit
			AdEvent.AdEventType.PAUSED -> Unit
			AdEvent.AdEventType.RESUMED ->Unit
			AdEvent.AdEventType.SKIPPABLE_STATE_CHANGED -> Unit
			AdEvent.AdEventType.SKIPPED -> Unit
			AdEvent.AdEventType.STARTED -> Unit
			AdEvent.AdEventType.TAPPED -> Unit
			AdEvent.AdEventType.ICON_TAPPED -> Unit
			AdEvent.AdEventType.THIRD_QUARTILE -> Unit
			AdEvent.AdEventType.LOADED -> Unit
			AdEvent.AdEventType.AD_PROGRESS -> Unit
			AdEvent.AdEventType.AD_BUFFERING -> Unit
			AdEvent.AdEventType.AD_BREAK_STARTED -> Unit
			AdEvent.AdEventType.AD_BREAK_ENDED -> Unit
			AdEvent.AdEventType.AD_PERIOD_STARTED -> Unit
			AdEvent.AdEventType.AD_PERIOD_ENDED -> Unit
			null -> Unit
		}
	}
}
