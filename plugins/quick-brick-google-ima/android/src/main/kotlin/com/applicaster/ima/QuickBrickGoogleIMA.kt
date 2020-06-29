package com.applicaster.ima

import android.content.Context
import android.net.Uri
import android.util.Log
import com.applicaster.ima.ads.*
import com.applicaster.player_protocol.api.PlayerEventCompletionListener
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerReceiverPlugin
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerSenderPlugin
import com.applicaster.util.OSUtil
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.google.ads.interactivemedia.v3.api.AdErrorEvent
import com.google.ads.interactivemedia.v3.api.AdEvent
import com.google.ads.interactivemedia.v3.impl.data.c
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.ext.ima.ImaAdsLoader
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.ads.AdsMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import com.google.android.exoplayer2.util.Util as exoUtil


class QuickBrickGoogleIMA :
		PlayerReceiverPlugin,
		Player.EventListener,
		AdEvent.AdEventListener,
		AdErrorEvent.AdErrorListener,
		ImaLoader.VideoPlayerEventsListener,
		LifecycleEventListener {

	override fun onAdError(p: AdErrorEvent?) {
		logData(p.toString())
	}

	private val tag = "QuickBrickGoogleIMA"

	private var context: Context? = null
	private var player: ExoPlayer? = null
	private var playerView: PlayerView? = null
	private var entry: Map<String, Any>? = null
	private var mediaSource: MediaSource? = null
	private var ads: Ad = Ad.Empty
	private var imaVastLoader: ImaLoader? = null
	private var imaVmapLoader: ImaAdsLoader? = null
	private var playerDidFinishCompletion: PlayerEventCompletionListener? = null
	private var adMarkers: Pair<LongArray, BooleanArray>? = null

	init {
		logData("init $tag")
	}

	override fun playerDidFinishPlayItem(player: PlayerSenderPlugin,
										 completion: PlayerEventCompletionListener) {
		this.playerDidFinishCompletion = completion
		if (!isAdsContainPostroll) {
			completion.onFinish(true)
			logData("playerDidFinishPlayItem => true")
		} else {
			completion.onFinish(false)
			logData("playerDidFinishPlayItem => false")
		}
	}

	override fun playerDidCreate(player: PlayerSenderPlugin) {
		logData("playerDidCreate")
		// Set init data
		initPlayer(player)
		this.player?.playWhenReady = true
		// init IMA ads loader
		initImaLoader()

		if (isAdsContainPreroll) {
			imaVastLoader?.timelineUpdate(0, Long.MAX_VALUE)
			logData("prerollCall")
		}
	}

	override fun playerDidDismiss(player: PlayerSenderPlugin) {
		logData("playerDidDismiss")
		release()
	}

	override fun playerProgressUpdate(player: PlayerSenderPlugin, currentTime: Long, duration: Long) {
		imaVastLoader?.timelineUpdate(currentTime, duration)
		logData("playerProgressUpdate => currentPosition: $currentTime ,duration: $duration")
	}

	//ImaLoader.VideoPlayerEventsListener methods
	override fun onPause() {
		player?.playWhenReady = false
	}

	override fun onPlay() {
		playerView?.player = this.player
		player?.playWhenReady = true
	}

	override fun onStop() {
		player?.stop()
	}

	override fun onPostrollFinished() {
		//notify the player that all ads was finished
		playerDidFinishCompletion?.onFinish(true)
		logData("onPostrollFinished")
	}

	override fun onPlayedAdMarkerPositionChanged(markerPosition: Int) {
		updateAdMarkers(markerPosition)
		logData("onPlayedAdMarkerPositionChanged => $markerPosition")
	}

	//RN lifecycle methods
	override fun onHostResume() {
		imaVastLoader?.resumeAd()
	}

	override fun onHostPause() {
		imaVastLoader?.pauseAd()
	}

	override fun onHostDestroy() {
		release()
	}

	private fun initImaLoader() {
		when (ads) {
			is Ad.Vast -> {
				initImaVastLoader()
				//prepare player
				mediaSource?.let { this.player?.prepare(it) }
				adMarkers = getAdMarkersPositions()
				this.playerView?.setExtraAdGroupMarkers(adMarkers?.first, adMarkers?.second)
			}
			is Ad.Vmap -> {
				initImaVmapLoader()
				//create ads media source and prepare player
				val adsMediaSource = adsMediaSource(this.mediaSource, createDefaultDataSourceFactory())
				this.player?.prepare(adsMediaSource)
			}
			Ad.Empty -> Uri.EMPTY
		}
	}

	private fun initImaVmapLoader() {
		context?.let {
			imaVmapLoader = ImaAdsLoader.Builder(it)
            					.setAdEventListener(this)
            					.buildForAdTag(getAdsTagUrl())
			imaVmapLoader?.setPlayer(this.player)
		}
	}

	private fun initImaVastLoader() {
		context?.let {
			imaVastLoader = ImaLoader.build {
				this.context = it
				this.cuePoints = ArrayList(getVastCuePoints())
			}
			imaVastLoader?.setPlayerView(playerView)
			imaVastLoader?.setVideoPlayerEventListener(this)
		}
	}

	private fun adsMediaSource(
			mediaSource: MediaSource?,
			defaultDataSourceFactory: DefaultDataSourceFactory) = AdsMediaSource(
			mediaSource,
			defaultDataSourceFactory,
			this.imaVmapLoader,
			this.playerView)

	private fun createDefaultDataSourceFactory() = DefaultDataSourceFactory(
			this.context,
			exoUtil.getUserAgent(this.context!!, OSUtil.getApplicationName()))

	private fun initPlayer(player: PlayerSenderPlugin) {
		//  Create Media instance
		this.player = player.playerObject as ExoPlayer
		// ref to main view
		this.playerView = player.pluginPlayerContainer as PlayerView
		// assign main view player to exoplayer
		this.playerView?.player = this.player
		//add exoplayer events listener
		this.player?.addListener(this)
		// video entry data
		this.entry = player.entry
		//parse ads if exists
		entry?.let { this.ads = parseAds(it) }
		//initialize context
		this.context = player.senderView.context
		//add RN lifecycle listener
		this.context?.let {
			if (it is ThemedReactContext) {
				it.addLifecycleEventListener(this)
			}
		}
		//initialize media source
		this.mediaSource = player.senderMediaSource as MediaSource
	}

	private fun getAdsTagUrl(): Uri =
			when (val currentAd = ads) {
				is Ad.Vmap -> currentAd.adTagUri
				else -> Uri.EMPTY
			}

	private fun getVastCuePoints(): MutableList<CuePoint> {
		return when (val currentAd = ads) {
			is Ad.Vast -> currentAd.cuePoints
			else -> mutableListOf()
		}
	}

	private fun updateAdMarkers(markerIndex: Int) {
		adMarkers?.second?.forEachIndexed { index, _ ->
			if (index <= markerIndex) adMarkers?.second?.set(index, true)
		}
		logData("updateAdMarkers => ${adMarkers?.second?.contentToString()}")
		this.playerView?.setExtraAdGroupMarkers(adMarkers?.first, adMarkers?.second)
	}

	private fun getAdMarkersPositions(): Pair<LongArray, BooleanArray> {
		val cuePoints = getVastCuePoints()
		val result: Pair<LongArray, BooleanArray> = LongArray(cuePoints.size) to BooleanArray(cuePoints.size)
		cuePoints.forEachIndexed { index, cuePoint ->
			when(val ad = cuePoint.adType) {
				is AdType.Preroll -> {
					result.first[index] = ad.offset
					result.second[index] = false
				}
				is AdType.Midroll -> {
					result.first[index] = ad.offset * 1_000
					result.second[index] = false
				}
				is AdType.Postroll -> {
					result.first[index] = ad.offset
					result.second[index] = false
				}
			}
		}
		return result
	}

	private val isAdsContainPostroll: Boolean
		get() {
			var result = false
			getVastCuePoints().forEach {
				when (it.adType) {
					is AdType.Postroll -> result = true
					else -> Unit
				}
			}
			return result
		}

	private val isAdsContainPreroll: Boolean
		get() {
			var result = false
			getVastCuePoints().forEach {
				when (it.adType) {
					is AdType.Preroll -> result = true
					else -> Unit
				}
			}
			return result
		}

	private fun release() {
		this.ads = Ad.Empty
		this.imaVmapLoader?.release()
		this.imaVastLoader?.release()
		this.player?.release()
		playerDidFinishCompletion = null
		adMarkers = null
	}

	private fun logData(message: String) {
		Log.d(tag, message)
	}

	override fun onAdEvent(event: AdEvent?) {

		when (event?.type) {
			AdEvent.AdEventType.COMPLETED -> playerView?.contentDescription = ""
			AdEvent.AdEventType.STARTED -> playerView?.contentDescription = getAdsTagUrl().toString()
		}
	}
}
