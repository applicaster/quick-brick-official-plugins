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
				private val cuePoints: MutableList<CuePoint>,
				private val language: String) :
		AdsLoader.AdsLoadedListener,
		AdEvent.AdEventListener,
		AdErrorEvent.AdErrorListener,
		VideoAdPlayer,
		Player.EventListener,
		ContentProgressProvider {

	private constructor(builder: Builder) :
			this(builder.context, builder.cuePoints, builder.language)

	companion object {
		inline fun build(block: Builder.() -> Unit) = Builder().apply(block).build()
	}

	class Builder {
		lateinit var context: Context
		var cuePoints: MutableList<CuePoint> = mutableListOf()
		var language: String = "en"
		fun build() = ImaLoader(this)
	}

	interface VideoPlayerEventsListener {
		fun onPause()
		fun onPlay()
		fun onStop()
		fun onPostrollFinished()
		fun onPlayedAdMarkerPositionChanged(markerPosition: Int)
	}

	//class fields
	private val TAG = this.javaClass.simpleName
	private var player: Player? = null
	private var videoPlayerEventsListener: VideoPlayerEventsListener? = null
	private var adsManager: AdsManager? = null
	private var adsLoader: AdsLoader? = null
	private var playerView: PlayerView? = null
	private var adDisplayContainer: AdDisplayContainer? = null
	private val adCallbacks: ArrayList<VideoAdPlayer.VideoAdPlayerCallback> = ArrayList(1)
	private var playbackSavedPosition: Long = C.TIME_UNSET
	private var isAdDisplayed = false
	private var isPostrollExists = false
	private var playedAdIndex = 0

	override fun onAdsManagerLoaded(event: AdsManagerLoadedEvent?) {
		adsManager = event?.adsManager
		adsManager?.addAdEventListener(this)
		val adsRenderingSettings = ImaSdkFactory.getInstance().createAdsRenderingSettings()
		adsManager?.init(adsRenderingSettings)
	}

	override fun onAdEvent(event: AdEvent?) {
		when (event?.type) {
			AdEvent.AdEventType.LOADED -> {
				adsManager?.start()
				Log.d(TAG, "${event.type?.name}")
			}
			AdEvent.AdEventType.CONTENT_PAUSE_REQUESTED -> {
				pauseContent()
				Log.d(TAG, "${event.type?.name}")
			}
			AdEvent.AdEventType.CONTENT_RESUME_REQUESTED -> {
				resumeContent()
				Log.d(TAG, "${event.type?.name}")
			}
			AdEvent.AdEventType.ALL_ADS_COMPLETED -> {
				if (isPostrollExists) {
					videoPlayerEventsListener?.onPostrollFinished()
					isPostrollExists = false
				}
				adsManager?.destroy()
				adsManager = null
				videoPlayerEventsListener?.onPlayedAdMarkerPositionChanged(playedAdIndex - 1)
				Log.d(TAG, "${event.type?.name}")
			}
			else -> Log.d(TAG, "${event?.type?.name}")
		}
	}

	override fun loadAd(adTagUrl: String) {
		isAdDisplayed = false
		playbackSavedPosition = player?.currentPosition ?: C.TIME_UNSET
		(player as? ExoPlayer?)?.prepare(createAdsMediaSource(adTagUrl), true, true)
		Log.d(TAG, "loadAd")
	}

	override fun playAd() {
		videoPlayerEventsListener?.onPause()
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
		if (isAdDisplayed) {
			adsManager?.pause()
			player?.playWhenReady = false
			isAdDisplayed = false
		}
	}

	override fun resumeAd() {
		if (!isAdDisplayed) {
			adsManager?.resume()
			player?.playWhenReady = true
			isAdDisplayed = true
		}
	}

	override fun getVolume(): Int =
			player?.audioComponent?.volume?.toInt() ?: 100

	override fun removeCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		callback?.let { adCallbacks.remove(it) }
	}

	override fun stopAd() {
		playerView?.useController = true
		player?.stop(true)
		player = null
		Log.d(TAG, "stopAd")
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
		this.playerView = playerView
		Log.d(TAG, "setPlayerView")
	}

	fun timelineUpdate(currentTime: Long, videoDuration: Long) {
		//request ads here if needed
		val currentTimeSec = currentTime / 1_000
		val videoDurationSec = videoDuration / 1_000
		val adTagUrlForRequest = getAdTagForCurrentPosition(currentTimeSec, videoDurationSec)
		if (adTagUrlForRequest != null) {
			initAdsPlayer()
			requestAds(adTagUrlForRequest)
		}
	}

	fun setVideoPlayerEventListener(listener: VideoPlayerEventsListener) {
		this.videoPlayerEventsListener = listener
	}

	private fun pauseContent() {
		player?.playWhenReady = false
		Log.d(TAG, "pauseContent")
	}

	private fun resumeContent() {
		playerView?.useController = true
		player?.stop()
		player?.release()
		videoPlayerEventsListener?.onPlay()
		Log.d(TAG, "resumeContent")
	}

	private fun getUserAgent() =
			Util.getUserAgent(this.context, OSUtil.getApplicationName())

	private fun createAdsMediaSource(adTagUrl: String): MediaSource =
			ProgressiveMediaSource.Factory(DefaultHttpDataSourceFactory(getUserAgent()))
					.createMediaSource(Uri.parse(adTagUrl))

	private fun requestAds(adTagUrl: String) {
		// Since we're switching to a new video, tell the SDK the previous video is finished.
		adsManager?.destroy()
		adsLoader?.contentComplete()
		val request = ImaSdkFactory.getInstance().createAdsRequest()
		request.adTagUrl = adTagUrl
		request.contentProgressProvider = this
		adsLoader?.requestAds(request)
		Log.d(TAG, "requestAds")
	}

	private fun getAdTagForCurrentPosition(currentPlayerPosition: Long, videoDuration: Long): String? {
		var adTagUrl: String? = null
		val index = cuePoints.indexOfLast {
			when (val type = it.adType) {
				is AdType.Midroll -> type.offset < currentPlayerPosition
				is AdType.Preroll -> type.offset == currentPlayerPosition
				is AdType.Postroll ->  {
					if (currentPlayerPosition == videoDuration)
						isPostrollExists = true
					currentPlayerPosition == videoDuration
				}
			}
		}
		if (index != -1) {
			adTagUrl = cuePoints[index].adTagUri.toString()
			playedAdIndex += index + 1
			cuePoints.subList(0, index + 1).clear()
		}
		return adTagUrl
	}

	private fun initAdsPlayer() {
		if (this.playerView == null) {
			throw RuntimeException("You must call [setPlayerView] method before calling ads")
		}
		if (this.videoPlayerEventsListener == null) {
			throw RuntimeException("You must call [setVideoPlayerEventListener] method before calling ads")
		}
		playerView?.hideController()
		this.player = SimpleExoPlayer.Builder(context).build()
		this.playerView?.player = this.player
		val sdkFactory = ImaSdkFactory.getInstance()
		val settings = sdkFactory.createImaSdkSettings()
		settings.language = this.language
		val adViewGroup = playerView?.adViewGroup
		adDisplayContainer = sdkFactory.createAdDisplayContainer()
		adDisplayContainer?.player = this
		adDisplayContainer?.adContainer = adViewGroup
		playerView?.adOverlayViews?.forEach {
			adDisplayContainer?.registerVideoControlsOverlay(it)
		}
		adsLoader = sdkFactory.createAdsLoader(context, settings, adDisplayContainer)
		adsLoader?.addAdErrorListener(this)
		adsLoader?.addAdsLoadedListener(this)
	}

	fun release() {
		player?.stop()
		player?.release()
		isAdDisplayed = false
		adDisplayContainer?.unregisterAllVideoControlsOverlays()
		cuePoints.clear()
		adsManager?.destroy()
		adsManager = null
		player = null
		videoPlayerEventsListener = null
		adsLoader = null
		playerView = null
		adCallbacks.clear()
		playbackSavedPosition = C.TIME_UNSET
		isPostrollExists = false
		playedAdIndex = 0
	}
}
