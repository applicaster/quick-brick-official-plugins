package com.applicaster.ima.ads

import android.content.Context
import android.util.Log
import com.applicaster.util.OSUtil
import com.google.ads.interactivemedia.v3.api.*
import com.google.ads.interactivemedia.v3.api.player.AdMediaInfo
import com.google.ads.interactivemedia.v3.api.player.ContentProgressProvider
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import com.google.ads.interactivemedia.v3.api.player.VideoProgressUpdate
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.ads.AdsMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import com.google.android.exoplayer2.util.Util
import java.io.IOException
import java.util.*
import kotlin.collections.ArrayList

class ImaLoader(private val context: Context,
				private val vmapTagUrl: String,
				private val cuePoints: List<CuePoint>) :
		AdsLoader.AdsLoadedListener,
		AdEvent.AdEventListener,
		AdErrorEvent.AdErrorListener,
		com.google.android.exoplayer2.source.ads.AdsLoader,
		VideoAdPlayer,
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

	//class fields
	private var player: Player? = null
	private var adsManager: AdsManager? = null
	private var adsLoader: AdsLoader? = null
	private var playerView: PlayerView? = null
	private var mediaSource: MediaSource? = null
	private val adCallbacks: ArrayList<VideoAdPlayer.VideoAdPlayerCallback> = ArrayList(1)

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
			}
			AdEvent.AdEventType.CONTENT_PAUSE_REQUESTED -> {
				pauseContent()
			}
			AdEvent.AdEventType.CONTENT_RESUME_REQUESTED -> {
				resumeContent()
			}
			AdEvent.AdEventType.ALL_ADS_COMPLETED -> {
				adsManager?.destroy()
				adsManager = null
			}
			AdEvent.AdEventType.AD_BREAK_FETCH_ERROR -> Unit
			AdEvent.AdEventType.CLICKED -> Unit
			AdEvent.AdEventType.COMPLETED -> Unit
			AdEvent.AdEventType.CUEPOINTS_CHANGED -> Unit
			AdEvent.AdEventType.FIRST_QUARTILE -> Unit
			AdEvent.AdEventType.LOG -> {
				Log.d("IMASDK", event.adData.toString())
			}
			AdEvent.AdEventType.AD_BREAK_READY -> Unit
			AdEvent.AdEventType.MIDPOINT -> Unit
			AdEvent.AdEventType.PAUSED -> Unit
			AdEvent.AdEventType.RESUMED -> Unit
			AdEvent.AdEventType.SKIPPABLE_STATE_CHANGED -> Unit
			AdEvent.AdEventType.SKIPPED -> Unit
			AdEvent.AdEventType.STARTED -> Unit
			AdEvent.AdEventType.TAPPED -> Unit
			AdEvent.AdEventType.ICON_TAPPED -> Unit
			AdEvent.AdEventType.THIRD_QUARTILE -> Unit
			AdEvent.AdEventType.AD_PROGRESS -> Unit
			AdEvent.AdEventType.AD_BUFFERING -> Unit
			AdEvent.AdEventType.AD_BREAK_STARTED -> Unit
			AdEvent.AdEventType.AD_BREAK_ENDED -> Unit
			AdEvent.AdEventType.AD_PERIOD_STARTED -> Unit
			AdEvent.AdEventType.AD_PERIOD_ENDED -> Unit
			else -> Unit
		}
	}

	override fun loadAd(adMediaInfo: AdMediaInfo?, adPodInfo: AdPodInfo?) {
		val adsMediaSource = adsMediaSource(this.mediaSource, createDefaultDataSourceFactory())
		player?.playWhenReady = true
		(player as? ExoPlayer?)?.prepare(adsMediaSource)
	}

	override fun pauseAd(adMediaInfo: AdMediaInfo?) {

	}

	override fun getVolume(): Int =
		player?.audioComponent?.volume?.toInt() ?: 100

	override fun removeCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		callback?.let { adCallbacks.remove(it) }
	}

	override fun stopAd(adMediaInfo: AdMediaInfo?) {
		Log.d("IMASDK", "stopAd => ${adMediaInfo?.url}")
		this.mediaSource?.let { (player as? ExoPlayer?)?.prepare(it) }
	}

	override fun addCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		callback?.let { adCallbacks.add(it) }
	}

	override fun getAdProgress(): VideoProgressUpdate {
		val durationMs: Long = player?.duration ?: 0
		if (durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		return VideoProgressUpdate(player?.currentPosition ?: 0L, durationMs)
	}

	override fun playAd(adMediaInfo: AdMediaInfo?) {
		Log.d("IMASDK", "playAd => ${adMediaInfo?.url}")
	}

	override fun getContentProgress(): VideoProgressUpdate {
		val durationMs: Long = player?.duration ?: 0
		if (durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		return VideoProgressUpdate(player?.currentPosition ?: 0L, durationMs)
	}

	private fun adsMediaSource(
			mediaSource: MediaSource?,
			defaultDataSourceFactory: DefaultDataSourceFactory): AdsMediaSource {
		return AdsMediaSource(mediaSource, defaultDataSourceFactory, this, playerView)
	}

	private fun createDefaultDataSourceFactory(): DefaultDataSourceFactory {
		return DefaultDataSourceFactory(
				this.context,
				Util.getUserAgent(this.context, OSUtil.getApplicationName()))
	}

	private fun pauseContent() {
		player?.playWhenReady = false
	}

	private fun resumeContent() {
		player?.playWhenReady = true
	}

	override fun onAdError(event: AdErrorEvent?) {
		Log.d("IMASDK", event?.error?.localizedMessage)
		resumeContent()
	}

	fun timelineUpdate(currentTime: Long) {
		//request ads here if needed
		requestAds(getAvailablePreroll()?.adTagUri.toString())
	}

	private fun requestAds(adTagUrl: String) {
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

	override fun handlePrepareError(adGroupIndex: Int, adIndexInAdGroup: Int, exception: IOException?) {

	}

	override fun start(eventListener: com.google.android.exoplayer2.source.ads.AdsLoader.EventListener?, adViewProvider: com.google.android.exoplayer2.source.ads.AdsLoader.AdViewProvider?) {

	}

	override fun stop() {

	}

	override fun setSupportedContentTypes(vararg contentTypes: Int) {

	}

	override fun release() {

	}

	override fun setPlayer(player: Player?) {

	}

	fun setPlayerView(playerView: PlayerView?) {
		this.playerView = playerView
		this.player = playerView?.player
		val sdkFactory = ImaSdkFactory.getInstance()
		val settings = sdkFactory.createImaSdkSettings()
		settings.language = "en"
		val adViewGroup = playerView?.adViewGroup
		val adDisplayContainer = ImaSdkFactory.createAdDisplayContainer(
				adViewGroup,
				this
		)
		adsLoader = sdkFactory.createAdsLoader(context, settings, adDisplayContainer)
		adsLoader?.addAdErrorListener(this)
		adsLoader?.addAdsLoadedListener(this)
	}

	fun setMediaSource(mediaSource: MediaSource?) {
		this.mediaSource = mediaSource
	}
}