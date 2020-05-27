package com.applicaster.ima.ads

import android.content.Context
import android.net.Uri
import android.util.Log
import com.applicaster.util.OSUtil
import com.google.ads.interactivemedia.v3.api.*
import com.google.ads.interactivemedia.v3.api.player.ContentProgressProvider
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import com.google.ads.interactivemedia.v3.api.player.VideoProgressUpdate
import com.google.android.exoplayer2.C
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.SimpleExoPlayer
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.ProgressiveMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultHttpDataSourceFactory
import com.google.android.exoplayer2.util.Util

class ImaLoader(private val context: Context,
				private val vmapTagUrl: String,
				private val cuePoints: List<CuePoint>) :
		AdsLoader.AdsLoadedListener,
		AdEvent.AdEventListener,
		AdErrorEvent.AdErrorListener,
		VideoAdPlayer,
		Player.EventListener,
		ContentProgressProvider {

	private constructor(builder: Builder) :
			this(builder.context, builder.vmapTagUrl, builder.cuePoints)

	companion object {
		inline fun build(block: Builder.() -> Unit) = Builder().apply(block).build()
	}

	class Builder {
		lateinit var context: Context
		var vmapTagUrl: String = ""
		var cuePoints: List<CuePoint> = listOf()

		fun build() = ImaLoader(this)
	}

	interface VideoPlayerEventListener {
		fun onPause()
		fun onPlay()
		fun onStop()
	}

	//class fields
	private val TAG = this.javaClass.simpleName
	private var player: Player? = null
	private var videoPlayerEventListener: VideoPlayerEventListener? = null
	private var adsManager: AdsManager? = null
	private var adsLoader: AdsLoader? = null
	private var playerView: PlayerView? = null
	private val adCallbacks: ArrayList<VideoAdPlayer.VideoAdPlayerCallback> = ArrayList(1)
	private var playbackSavedPosition: Long = C.TIME_UNSET
	private var isAdDisplayed = false

	override fun onAdsManagerLoaded(event: AdsManagerLoadedEvent?) {
		adsManager = event?.adsManager
		adsManager?.addAdEventListener(this)
		val adsRenderingSettings = ImaSdkFactory.getInstance().createAdsRenderingSettings()
		adsManager?.init(adsRenderingSettings)
	}

	override fun onAdEvent(event: AdEvent?) {
		when (event?.type) {
			AdEvent.AdEventType.LOADED -> {
				Log.d(TAG, "${event.type?.name}")
				adsManager?.start()
			}
			AdEvent.AdEventType.CONTENT_PAUSE_REQUESTED -> {
				Log.d(TAG, "${event.type?.name}")
				pauseContent()
			}
			AdEvent.AdEventType.CONTENT_RESUME_REQUESTED -> {
				Log.d(TAG, "${event.type?.name}")
				resumeContent()
			}
			AdEvent.AdEventType.ALL_ADS_COMPLETED -> {
				Log.d(TAG, "${event.type?.name}")
				adsManager?.destroy()
				adsManager = null
			}
			AdEvent.AdEventType.CLICKED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.COMPLETED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.CUEPOINTS_CHANGED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.FIRST_QUARTILE -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.LOG -> Log.d(TAG, event.adData.toString())
			AdEvent.AdEventType.AD_BREAK_READY -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.MIDPOINT -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.PAUSED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.RESUMED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.SKIPPABLE_STATE_CHANGED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.SKIPPED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.STARTED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.TAPPED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.ICON_TAPPED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.THIRD_QUARTILE -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_PROGRESS -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_BUFFERING -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_BREAK_STARTED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_BREAK_ENDED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_PERIOD_STARTED -> Log.d(TAG, "${event.type?.name}")
			AdEvent.AdEventType.AD_PERIOD_ENDED -> Log.d(TAG, "${event.type?.name}")
			else -> Log.d(TAG, "${event?.type?.name}")
		}
	}

	override fun loadAd(adTagUrl: String) {
		Log.d(TAG, "loadAd")
		isAdDisplayed = false
		playbackSavedPosition = player?.currentPosition ?: C.TIME_UNSET
		(player as? ExoPlayer?)?.prepare(createAdsMediaSource(adTagUrl), true, true)
	}

	override fun playAd() {
		videoPlayerEventListener?.onPause()
		if (isAdDisplayed) {
			player?.playWhenReady = true
		} else {
			isAdDisplayed = true
			playerView?.hideController()
			playerView?.useController = false
			player?.playWhenReady = true
		}
		Log.d(TAG, "playAd")
	}

	override fun pauseAd() {
		player?.playWhenReady = false
	}

	override fun resumeAd() {
		player?.playWhenReady = true
	}

	override fun getVolume(): Int =
		player?.audioComponent?.volume?.toInt() ?: 100

	override fun removeCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		callback?.let { adCallbacks.remove(it) }
	}

	override fun stopAd() {
		Log.d(TAG, "stopAd")
		playerView?.useController = true
		player?.stop(true)
		player = null
	}

	override fun addCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		callback?.let { adCallbacks.add(it) }
	}

	override fun getAdProgress(): VideoProgressUpdate {
		val durationMs: Long = player?.duration ?: 0
		Log.d(TAG, "getAdProgress => ${player?.currentPosition?.div(1000)}")
		if (!isAdDisplayed || durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		if (player?.currentPosition ?: 0 >= durationMs) {
			adsManager?.destroy()
		}
		return VideoProgressUpdate(player?.currentPosition ?: 0L, durationMs)
	}

	override fun getContentProgress(): VideoProgressUpdate {
		val durationMs: Long = player?.duration ?: 0
		Log.d(TAG, "getContentProgress => ${player?.currentPosition?.div(1000)}")
		if (isAdDisplayed || durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		return VideoProgressUpdate(player?.currentPosition ?: 0L, durationMs)
	}

	override fun onAdError(event: AdErrorEvent?) {
		Log.d(TAG, event?.error?.localizedMessage)
		adsManager?.destroy()
		resumeContent()
	}

	fun setPlayerView(playerView: PlayerView?) {
		Log.d(TAG, "setPlayerView")
		this.playerView = playerView
	}

	fun timelineUpdate(currentTime: Long) {
		//request ads here if needed
		initAdsPlayer()
		requestAds(getAvailablePreroll()?.adTagUri.toString())
	}

	fun setVideoPlayerEventListener(listener: VideoPlayerEventListener) {
		this.videoPlayerEventListener = listener
	}

	private fun pauseContent() {
		Log.d(TAG, "pauseContent")
		player?.playWhenReady = false
	}

	private fun resumeContent() {
		Log.d(TAG, "resumeContent")
		playerView?.useController = true
		player?.stop()
		player?.release()
		videoPlayerEventListener?.onPlay()
	}

	private fun getUserAgent() =
			Util.getUserAgent(this.context, OSUtil.getApplicationName())

	private fun createAdsMediaSource(adTagUrl: String): MediaSource =
			ProgressiveMediaSource.Factory(DefaultHttpDataSourceFactory(getUserAgent()))
					.createMediaSource(Uri.parse(adTagUrl))

	private fun requestAds(adTagUrl: String) {
		Log.d(TAG, "requestAds")
		// Since we're switching to a new video, tell the SDK the previous video is finished.
		adsManager?.destroy()
		adsLoader?.contentComplete()
		val request = ImaSdkFactory.getInstance().createAdsRequest()
		request.adTagUrl = adTagUrl
		request.contentProgressProvider = this
		adsLoader?.requestAds(request)
	}

	private fun getCuePointOffsets() =
		getCuePointsOffsets()

	private fun getCuePointsOffsets(): List<Float> {
		val prerollOffset = 0f //preroll should be always 0
		val postrollOffset = -1f //postroll should be always -1
		return cuePoints.map {
			when (it.adType) {
				is AdType.Preroll -> {
					prerollOffset
				}
				is AdType.Midroll -> {
					val offset = it.adType.offset
					offset.toFloat()
				}
				else -> {
					postrollOffset
				}
			}
		}
	}

	private fun getAvailablePreroll(): CuePoint? {
		var preroll: CuePoint? = null
		cuePoints.forEach {
			val type = it.adType
			if (type is AdType.Preroll) {
				preroll = it.withNewAdState(it, AdState.AVAILABLE)
			}
		}
		return preroll
	}

	private fun getAdTagForCurrentPosition(currentPlayerPosition: Long): String {
		return ""
	}

	private fun initAdsPlayer() {
		this.player = SimpleExoPlayer.Builder(context).build()
		this.playerView?.player = this.player
		val sdkFactory = ImaSdkFactory.getInstance()
		val settings = sdkFactory.createImaSdkSettings()
		settings.language = "en"
		val adViewGroup = playerView?.adViewGroup
		val adDisplayContainer = sdkFactory.createAdDisplayContainer()
		adDisplayContainer.player = this
		adDisplayContainer.adContainer = adViewGroup
		playerView?.adOverlayViews?.forEach {
			adDisplayContainer.registerVideoControlsOverlay(it)
		}
		adsLoader = sdkFactory.createAdsLoader(context, settings, adDisplayContainer)
		adsLoader?.addAdErrorListener(this)
		adsLoader?.addAdsLoadedListener(this)
	}
}