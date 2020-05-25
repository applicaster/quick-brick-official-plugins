package com.applicaster.ima.ads

import android.content.Context
import android.net.Uri
import android.util.Log
import com.google.ads.interactivemedia.v3.api.*
import com.google.ads.interactivemedia.v3.api.AdEvent.AdEventType
import com.google.ads.interactivemedia.v3.api.player.ContentProgressProvider
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer.VideoAdPlayerCallback
import com.google.ads.interactivemedia.v3.api.player.VideoProgressUpdate
import com.google.android.exoplayer2.C
import com.google.android.exoplayer2.ExoPlaybackException
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.Player.TimelineChangeReason
import com.google.android.exoplayer2.Timeline
import com.google.android.exoplayer2.source.ads.AdPlaybackState
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.util.MimeTypes
import java.io.IOException
import java.util.*
import kotlin.collections.ArrayList

class ImaVastLoader(context: Context) :
		VideoAdPlayer,
		com.google.android.exoplayer2.source.ads.AdsLoader,
		Player.EventListener,
		ContentProgressProvider {

	//region Class members
	var adsTagUrl: Uri = Uri.parse("https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dskippablelinear&correlator=")
	private var eventListener: com.google.android.exoplayer2.source.ads.AdsLoader.EventListener? = null
	private var adPlaybackState: AdPlaybackState? = null
	private val supportedMimeTypes: ArrayList<String> = arrayListOf()
	private var player: Player? = null
	private var adsLoader: AdsLoader? = null
	private var adDisplayContainer: AdDisplayContainer? = null
	private var adsManager: AdsManager? = null
	private var imaSdkFactory: ImaSdkFactory? = null
	private var adsManagerState: AdsManagerState = AdsManagerState.IDLE

	//ad
	private var adViewState: AdViewState = AdViewState.IDLE
	private val adCallbacks: ArrayList<VideoAdPlayerCallback> = ArrayList(1)
	private var playAdsAfterTime: Double = -1.0
	//endregion

	//region Class initializer
	init {
		// Create an AdsLoader and optionally set the language.
		imaSdkFactory = ImaSdkFactory.getInstance()
		val imaSdkSettings: ImaSdkSettings? = imaSdkFactory?.createImaSdkSettings()

		//create AdDisplayContainer and set player to it
		adDisplayContainer = imaSdkFactory?.createAdDisplayContainer()
		adDisplayContainer?.player = this

		//create AdsLoader and set up listeners
		adsLoader = imaSdkFactory?.createAdsLoader(context, imaSdkSettings, adDisplayContainer)
		adsLoader?.addAdErrorListener { adErrorEvent ->
			/** An event raised when there is an error loading or playing ads.  */
			log("Ad Error: " + adErrorEvent.error.message)
			resumeContent()
		}
		adsLoader?.addAdsLoadedListener(AdsLoadedListener())
	}
	//endregion

	//
	override fun handlePrepareError(adGroupIndex: Int, adIndexInAdGroup: Int, exception: IOException?) {

	}

	override fun start(eventListener: com.google.android.exoplayer2.source.ads.AdsLoader.EventListener?,
					   adViewProvider: com.google.android.exoplayer2.source.ads.AdsLoader.AdViewProvider?) {
		log("start")
		this.eventListener = eventListener
		val adViewGroup = adViewProvider?.adViewGroup
		adDisplayContainer?.adContainer = adViewGroup
		val adOverlayViews = adViewProvider?.adOverlayViews
		adOverlayViews?.forEach {
			adDisplayContainer?.registerVideoControlsOverlay(it)
		}
		player?.addListener(this)

		var shouldRequestAds = true

		adPlaybackState?.let {
			shouldRequestAds = false
			updateEvents(it)
		}
		adsManager?.let {
			shouldRequestAds = false
			this.adPlaybackState = AdPlaybackState(0, 10_000_000, 20_000_000, C.TIME_END_OF_SOURCE)
			requestAndPlayAds(adsTagUrl, playAdsAfterTime)
		}
		if (shouldRequestAds) {
			requestAndPlayAds(adsTagUrl, playAdsAfterTime)
		}
	}

	override fun stop() {
		log("stop")
		adDisplayContainer?.unregisterAllVideoControlsOverlays()
	}

	private fun updateEvents(adPlaybackState: AdPlaybackState) {
		this.eventListener?.onAdPlaybackState(adPlaybackState)
	}

	override fun setSupportedContentTypes(vararg contentTypes: Int) {
		log("setSupportedContentTypes")
		for (@C.ContentType contentType in contentTypes) {
			when (contentType) {
				C.TYPE_DASH -> {
					supportedMimeTypes.add(MimeTypes.APPLICATION_MPD)
				}
				C.TYPE_HLS -> {
					supportedMimeTypes.add(MimeTypes.APPLICATION_M3U8)
				}
				C.TYPE_OTHER -> {
					supportedMimeTypes.addAll(
							listOf(
									MimeTypes.VIDEO_MP4,
									MimeTypes.VIDEO_WEBM,
									MimeTypes.VIDEO_H263,
									MimeTypes.AUDIO_MP4,
									MimeTypes.AUDIO_MPEG))
				}
				C.TYPE_SS -> { // IMA does not support Smooth Streaming ad media.
				}
			}
		}
	}

	override fun release() {
		log("release")
		this.player = null
	}

	override fun setPlayer(player: Player?) {
		log("setPlayer")
		this.player = player
	}
	//

	//region Public methods
	/** Request and subsequently play video ads from the ad server.  */
	fun requestAndPlayAds(adsTagUrl: Uri, playAdsAfterTime: Double) {
		if (adsTagUrl.toString().isEmpty()) {
			log("No VAST ad tag URL specified")
			resumeContent()
			return
		}
		// Since we're switching to a new video, tell the SDK the previous video is finished.
		adsManager?.destroy()
		adsLoader?.contentComplete()
		// Create the ads request.
		val request: AdsRequest? = imaSdkFactory?.createAdsRequest()
		request?.adTagUrl = adsTagUrl.toString()
		request?.contentProgressProvider = this
		this.playAdsAfterTime = playAdsAfterTime
		// Request the ad. After the ad is loaded, onAdsManagerLoaded() will be called.
		adsLoader?.requestAds(request)
	}
	//endregion

	//region Private methods
	private fun resumeContent() {
		if (player?.isPlaying == false)
			player?.playWhenReady = true
	}

	private fun pauseContent() {
		if (player?.isPlaying == true)
			player?.playWhenReady = false
	}

	private fun log(vararg messages: String) {
		val logMessage = messages.joinToString(" | ")
		Log.d(this.javaClass.simpleName, logMessage)
	}
	//endregion

	//region Exoplayer events
	override fun onSeekProcessed() {
		log("onSeekProcessed")
	}

	override fun onPlayerError(error: ExoPlaybackException) {
		log("onPlayerError")
		adCallbacks.forEach { it.onError() }
	}

	override fun onPositionDiscontinuity(reason: Int) {
		log("onPositionDiscontinuity")
	}

	override fun onTimelineChanged(timeline: Timeline, @TimelineChangeReason reason: Int) {
		log("onTimelineChanged")
		val contentDurationUs = timeline.getPeriod(0, Timeline.Period()).durationUs
//		contentDurationMs = C.usToMs(contentDurationUs)
		if (contentDurationUs != C.TIME_UNSET) {
			adPlaybackState = adPlaybackState?.withContentDurationUs(contentDurationUs)
		}
		if (adsManagerState == AdsManagerState.IDLE && adsManager != null) {
			adsManagerState = AdsManagerState.INITIALIZED
			initAdsManager()
		}
	}

	override fun onPlayerStateChanged(playWhenReady: Boolean, @Player.State playbackState: Int) {
		log("onPlayerStateChanged")
	}
	//endregion

	//region VideoAdPlayer methods
	override fun loadAd(adTagUrl: String?) {
		log("loadAd")
		adPlaybackState = adPlaybackState?.withAdUri(0, 0, Uri.parse(adTagUrl))
		adPlaybackState?.let { updateEvents(it) }
	}

	override fun playAd() {
		log("playAd")
	}

	override fun resumeAd() {
		log("resumeAd")
	}

	override fun pauseAd() {
		log("pauseAd")
	}

	override fun stopAd() {
		log("stopAd")
	}

	override fun addCallback(videoAdPlayerCallback: VideoAdPlayer.VideoAdPlayerCallback?) {
		videoAdPlayerCallback?.let { adCallbacks.add(it) }
	}

	override fun removeCallback(videoAdPlayerCallback: VideoAdPlayer.VideoAdPlayerCallback?) {
		videoAdPlayerCallback?.let { adCallbacks.remove(it) }
	}

	override fun getAdProgress(): VideoProgressUpdate {
		log("getAdProgress => ",
				"adViewState: ${adViewState.name}",
				"currentPosition: ${player?.currentPosition}",
				"contentDuration: ${player?.contentDuration}")
		return if (adViewState != AdViewState.DISPLAYED
				|| player?.duration?.let { it <= 0 } == true) {
			VideoProgressUpdate.VIDEO_TIME_NOT_READY
		} else  {
			VideoProgressUpdate(player?.currentPosition ?: 0L, player?.duration ?: 0L)
		}
	}

	override fun getVolume(): Int {
		log("getVolume")
		return player?.audioComponent?.volume?.toInt() ?: 0
	}

	//ContentProgressProvider
	override fun getContentProgress(): VideoProgressUpdate {
		log("getContentProgress")
		return if (adViewState != AdViewState.DISPLAYED
				|| player?.duration?.let { it <= 0 } == true) {
			VideoProgressUpdate.VIDEO_TIME_NOT_READY
		} else  {
			VideoProgressUpdate(player?.currentPosition ?: 0L, player?.duration ?: 0L)
		}
	}
	//endregion

	//region Inner structures
	private enum class AdViewState {
		DISPLAYED,
		IDLE
	}

	private enum class PlaybackState {
		STOPPED,
		PAUSED,
		PLAYING
	}

	private enum class AdsManagerState {
		INITIALIZED,
		IDLE
	}

	// Inner class implementation of AdsLoader.AdsLoaderListener.
	private inner class AdsLoadedListener : AdsLoader.AdsLoadedListener {
		/** An event raised when ads are successfully loaded from the ad server via AdsLoader.  */
		override fun onAdsManagerLoaded(adsManagerLoadedEvent: AdsManagerLoadedEvent) {
			log("onAdsManagerLoaded")
			// Ads were successfully loaded, so get the AdsManager instance. AdsManager has
			// events for ad playback and errors.
			adsManager = adsManagerLoadedEvent.adsManager
			// Attach event and error event listeners.
			adsManager?.addAdErrorListener { adErrorEvent ->
				/** An event raised when there is an error loading or playing ads.  */
				log("Ad Error: " + adErrorEvent.error.message)
				resumeContent()
			}
			adsManager?.addAdEventListener { adEvent ->
				/** Responds to AdEvents.  */
				log("Event: " + adEvent.type)
				when (adEvent.type) {
					AdEventType.LOADED -> { // AdEventType.LOADED will be fired when ads are ready to be
						// played. AdsManager.start() begins ad playback. This method is
						// ignored for VMAP or ad rules playlists, as the SDK will
						// automatically start executing the playlist.
						adViewState = AdViewState.DISPLAYED
						adsManager?.start()
					}
					AdEventType.CONTENT_PAUSE_REQUESTED ->  // AdEventType.CONTENT_PAUSE_REQUESTED is fired immediately before
						// a video ad is played.
						pauseContent()
					AdEventType.CONTENT_RESUME_REQUESTED ->  // AdEventType.CONTENT_RESUME_REQUESTED is fired when the ad is
						// completed and you should start playing your content.
						resumeContent()
					AdEventType.PAUSED -> adViewState = AdViewState.IDLE
					AdEventType.RESUMED -> adViewState = AdViewState.DISPLAYED
					AdEventType.ALL_ADS_COMPLETED -> {
						adsManager?.destroy()
						adsManager = null
					}
					AdEventType.CLICKED -> log(adEvent.type.name)
					AdEventType.COMPLETED -> log(adEvent.type.name)
					AdEventType.CUEPOINTS_CHANGED -> log(adEvent.type.name)
					AdEventType.FIRST_QUARTILE -> log(adEvent.type.name)
					AdEventType.LOG -> log(adEvent.type.name)
					AdEventType.AD_BREAK_READY -> log(adEvent.type.name)
					AdEventType.MIDPOINT -> log(adEvent.type.name)
					AdEventType.SKIPPABLE_STATE_CHANGED -> log(adEvent.type.name)
					AdEventType.SKIPPED -> log(adEvent.type.name)
					AdEventType.STARTED -> {
						adViewState = AdViewState.DISPLAYED
						log(adEvent.type.name)
					}
					AdEventType.TAPPED -> log(adEvent.type.name)
					AdEventType.ICON_TAPPED -> log(adEvent.type.name)
					AdEventType.THIRD_QUARTILE -> log(adEvent.type.name)
					AdEventType.AD_PROGRESS -> log(adEvent.type.name)
					AdEventType.AD_BUFFERING -> log(adEvent.type.name)
					AdEventType.AD_BREAK_STARTED -> log(adEvent.type.name)
					AdEventType.AD_BREAK_ENDED -> log(adEvent.type.name)
					AdEventType.AD_PERIOD_STARTED -> log(adEvent.type.name)
					AdEventType.AD_PERIOD_ENDED -> log(adEvent.type.name)
					else -> Unit
				}
			}
			// If a player is attached already, start playback immediately.
			try {
//				adPlaybackState = AdPlaybackState(*getAdGroupTimesUs(adsManager?.adCuePoints))
				adPlaybackState = AdPlaybackState(0, 10_000_000, 20_000_000, C.TIME_END_OF_SOURCE)
				adPlaybackState?.let { updateEvents(it) }
			} catch (e: Exception) {

			}
		}
	}

	private fun initAdsManager() {
		val adsRenderingSettings = ImaSdkFactory.getInstance().createAdsRenderingSettings()
		adsRenderingSettings.mimeTypes = supportedMimeTypes

		// Skip ads based on the start position as required.
		val adGroupTimesUs = getAdGroupTimesUs(arrayListOf(0F, 10F, 20F, -1F))
		val contentPositionMs = player?.contentPosition
		val adGroupIndexForPosition = adPlaybackState?.getAdGroupIndexForPositionUs(C.msToUs(contentPositionMs ?: 0)) ?: 0
		if (adGroupIndexForPosition > 0 && adGroupIndexForPosition != C.INDEX_UNSET) { // Skip any ad groups before the one at or immediately before the playback position.
			for (i in 0 until adGroupIndexForPosition) {
				adPlaybackState = adPlaybackState?.withSkippedAdGroup(i)
			}
			// Play ads after the midpoint between the ad to play and the one before it, to avoid issues
// with rounding one of the two ad times.
			val adGroupForPositionTimeUs = adGroupTimesUs[adGroupIndexForPosition]
			val adGroupBeforeTimeUs = adGroupTimesUs[adGroupIndexForPosition - 1]
			val midpointTimeUs = (adGroupForPositionTimeUs + adGroupBeforeTimeUs) / 2.0
			adsRenderingSettings.setPlayAdsAfterTime(midpointTimeUs / C.MICROS_PER_SECOND)
		}

		// IMA indexes any remaining midroll ad pods from 1. A preroll (if present) has index 0.
		// Store an index offset as we want to index all ads (including skipped ones) from 0.
//		if (adGroupIndexForPosition == 0 && adGroupTimesUs[0] == 0) { // We are playing a preroll.
//			podIndexOffset = 0
//		} else if (adGroupIndexForPosition == C.INDEX_UNSET) { // There's no ad to play which means there's no preroll.
//			podIndexOffset = -1
//		} else { // We are playing a midroll and any ads before it were skipped.
//			podIndexOffset = adGroupIndexForPosition - 1
//		}
//
//		if (adGroupIndexForPosition != C.INDEX_UNSET && ZappImaAdsLoader.hasMidrollAdGroups(adGroupTimesUs)) { // Provide the player's initial position to trigger loading and playing the ad.
//			pendingContentPositionMs = contentPositionMs
//		}

		adsManager?.init(adsRenderingSettings)
		adPlaybackState?.let { updateEvents(it) }
	}

	private fun getAdGroupTimesUs(cuePoints: MutableList<Float>?): LongArray {
		return cuePoints?.let {
			if (it.isEmpty()) { // If no cue points are specified, there is a preroll ad.
				return longArrayOf(0)
			}
			val count = it.size
			val adGroupTimesUs = LongArray(count)
			var adGroupIndex = 0
			for (i in 0 until count) {
				val cuePoint = it[i].toDouble()
				if (cuePoint == -1.0) {
					adGroupTimesUs[count - 1] = C.TIME_END_OF_SOURCE
				} else {
					adGroupTimesUs[adGroupIndex++] = (C.MICROS_PER_SECOND * cuePoint).toLong()
				}
			}
			// Cue points may be out of order, so sort them.
			Arrays.sort(adGroupTimesUs, 0, adGroupIndex)
			adGroupTimesUs
		} ?: longArrayOf(0)
	}
//endregion
}