package com.applicaster.ima

import android.content.Context
import android.net.Uri
import android.os.Looper
import android.util.Log
import com.applicaster.ima.ads.*
import com.applicaster.plugin_manager.dependencyplugin.base.interfaces.SenderPlugin
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerReceiverPlugin
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerSenderPlugin
import com.applicaster.util.OSUtil
import com.google.ads.interactivemedia.v3.api.AdErrorEvent
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.Timeline
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import java.util.logging.Handler
import com.google.android.exoplayer2.util.Util as exoUtil


class QuickBrickGoogleIMA :
		PlayerReceiverPlugin,
		Player.EventListener,
		AdErrorEvent.AdErrorListener,
		ImaLoader.VideoPlayerEventListener {

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
	private var nextQuePointPosition = 0
	private lateinit var imaLoader: ImaLoader
	private var isAdsStartWasCalled = false

	init {
		logData("init $tag")
	}

	override fun playerDidFinishPlayItem(player: PlayerSenderPlugin) {
		logData("playerDidFinishPlayItem")
//		imaLoader?.release()
	}

	override fun playerDidCreate(player: PlayerSenderPlugin) {
		logData("playerDidCreate")

		// Set init data
		initPlayer(player)


		this.player?.playWhenReady = true

		// init IMA ads loader
		initImaLoader()

		// Creates ads media source

//		val adsMediaSource = adsMediaSource(this.mediaSource, createDefaultDataSourceFactory())

		this.player?.prepare(mediaSource!!)
	}

	private fun initImaLoader() {
		when (ads) {
			is Ad.Vast -> initImaVastLoader()
			is Ad.Vmap -> initImaVmapLoader()
			Ad.Empty -> Uri.EMPTY
		}
	}

	private fun initImaVmapLoader() {
		context?.let {
			imaLoader = ImaLoader.build {
				this.context = it
				this.vmapTagUrl = getAdsTagUrl().toString()
			}
			imaLoader.setPlayerView(playerView)
		}
	}

	private fun initImaVastLoader() {
		context?.let {
			imaLoader = ImaLoader.build {
				this.context = it
				this.cuePoints = getVastCuePoints()
			}
			imaLoader.setVideoPlayerEventListener(this)
		}
	}

//	private fun adsMediaSource(
//			mediaSource: MediaSource?,
//			defaultDataSourceFactory: DefaultDataSourceFactory) = AdsMediaSource(
//			mediaSource,
//			defaultDataSourceFactory,
//			this.imaLoader,
//			this.playerView)

	private fun createDefaultDataSourceFactory() = DefaultDataSourceFactory(
			this.context,
			exoUtil.getUserAgent(this.context!!, OSUtil.getApplicationName()))

	private fun initPlayer(player: PlayerSenderPlugin) {
		//  Create Media instance
		this.player = player.playerObject as ExoPlayer

		// ref to main view
		this.playerView = player.pluginPlayerContainer as PlayerView

//		this.playerTimeBar = this.playerView?.findViewById(R.id.exo_progress)

		// assign main view player to exoplayer
		this.playerView?.player = this.player

		this.player?.addListener(this)

		// video entry data
		this.entry = player.entry

		entry?.let { this.ads = parseAds(it) }

		this.context = player.senderView.context

		this.mediaSource = player.senderMediaSource as MediaSource

	}

	private fun getAdsTagUrl(): Uri =
			when (val currentAd = ads) {
				is Ad.Vast -> currentAd.cuePoints[nextQuePointPosition].adTagUri
				is Ad.Vmap -> currentAd.adTagUri
				Ad.Empty -> Uri.EMPTY
			}

	private fun getVastCuePoints(): List<CuePoint> {
		return when (val currentAd = ads) {
			is Ad.Vast -> currentAd.cuePoints
			else -> listOf()
		}
	}

	override fun playerDidDismiss(player: PlayerSenderPlugin) {
		logData("playerDidDismiss")
		release()
	}

	private fun release() {
		this.player?.release()
		isAdsStartWasCalled = false
//		this.imaLoader?.release()
	}

	override fun playerProgressUpdate(player: PlayerSenderPlugin, currentTime: Long, duration: Long) {
		imaLoader.timelineUpdate(playerView)
		logData("playerProgressUpdate")
	}

	override fun onTimelineChanged(timeline: Timeline, reason: Int) {
		logData("onTimelineChanged")
		if (!isAdsStartWasCalled) {
			imaLoader.timelineUpdate(playerView)
			isAdsStartWasCalled = true
			android.os.Handler(Looper.getMainLooper()).postDelayed({
				imaLoader.timelineUpdate(playerView)
			}, 40_000)
		}
	}

	override fun receiveEvent(eventName: String, sender: SenderPlugin) {
		logData("receiveEvent => eventName: $eventName, sender: ${sender.dependencyType}")
	}

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

	private fun logData(message: String) {
		Log.d(tag, message)
	}

	private fun checkMidrollPosition(currentTime: Long) {
		when (val currentAd = ads) {
			is Ad.Vast -> {
				currentAd.cuePoints[nextQuePointPosition].adTagUri
			}
			is Ad.Vmap -> currentAd.adTagUri
			Ad.Empty -> Uri.EMPTY
		}
	}
}
