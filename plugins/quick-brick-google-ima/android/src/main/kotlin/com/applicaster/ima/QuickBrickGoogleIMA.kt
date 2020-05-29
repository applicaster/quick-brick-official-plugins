package com.applicaster.ima

import android.content.Context
import android.net.Uri
import android.util.Log
import android.widget.ImageButton
import com.applicaster.ima.ads.*
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerReceiverPlugin
import com.applicaster.plugin_manager.dependencyplugin.playerplugin.PlayerSenderPlugin
import com.applicaster.util.OSUtil
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.ThemedReactContext
import com.google.ads.interactivemedia.v3.api.AdErrorEvent
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.ext.ima.ImaAdsLoader
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.source.ads.AdsMediaSource
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import io.reactivex.Observable
import io.reactivex.android.schedulers.AndroidSchedulers
import io.reactivex.disposables.Disposable
import java.util.concurrent.TimeUnit
import com.google.android.exoplayer2.util.Util as exoUtil


class QuickBrickGoogleIMA :
		PlayerReceiverPlugin,
		Player.EventListener,
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
	private var playbackProgressObservable: Disposable? = null
	private var vastAdsSate: VastAdsSate = VastAdsSate.NO_ADS

	init {
		logData("init $tag")
	}

	override fun playerDidFinishPlayItem(player: PlayerSenderPlugin) {
		logData("playerDidFinishPlayItem")
	}

	override fun playerDidCreate(player: PlayerSenderPlugin) {
		logData("playerDidCreate")
		// Set init data
		initPlayer(player)
		this.player?.playWhenReady = true
		// init IMA ads loader
		initImaLoader()
	}

	override fun playerDidDismiss(player: PlayerSenderPlugin) {
		logData("playerDidDismiss")
		release()
	}

	override fun playerProgressUpdate(player: PlayerSenderPlugin, currentTime: Long, duration: Long) {
		logData("playerProgressUpdate")
	}

	override fun onPlayerStateChanged(playWhenReady: Boolean, playbackState: Int) {
		when (playbackState) {
			Player.STATE_READY -> videoReady()
			Player.STATE_ENDED -> {
				playbackProgressObservable?.dispose()
				this.imaVmapLoader?.release()
			}
			else -> Unit
		}
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

	override fun onAllAdsFinished() {
		//notify the player that all ads was finished
		vastAdsSate = VastAdsSate.FINISHED
		logData("allAdsFinished")
	}

	//RN lifecycle methods
	override fun onHostResume() {
		imaVastLoader?.resumeAd()
	}

	override fun onHostPause() {
		imaVastLoader?.pauseAd()
	}

	override fun onHostDestroy() {
		this.imaVastLoader?.release()
	}

	private fun initImaLoader() {
		when (ads) {
			is Ad.Vast -> {
				initImaVastLoader()
				//prepare player
				mediaSource?.let { this.player?.prepare(it) }
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
			vastAdsSate = VastAdsSate.IN_PROGRESS
			imaVmapLoader = ImaAdsLoader(it, getAdsTagUrl())
			imaVmapLoader?.setPlayer(this.player)
		}
	}

	private fun initImaVastLoader() {
		context?.let {
			imaVastLoader = ImaLoader.build {
				this.context = it
				this.cuePoints = getVastCuePoints()
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

	private fun release() {
		this.player?.release()
	}

	private fun videoReady() {
		if (getVastCuePoints().isNotEmpty()) {
			playbackProgressObservable = timeUpdate()
					.observeOn(AndroidSchedulers.mainThread())
					.subscribe {
						imaVastLoader?.timelineUpdate(player?.currentPosition
								?: 0, player?.contentDuration ?: 0)
					}
		}
	}

	private fun timeUpdate(): Observable<Long> {
		return Observable.interval(1, TimeUnit.SECONDS)
				.map { checkIfPlayerIsPlaying() }
	}

	private fun checkIfPlayerIsPlaying(): Long {
		if (player?.isPlaying == true){
			return player?.currentPosition ?: 0
		}
		return 1.toLong()
	}

	private fun logData(message: String) {
		Log.d(tag, message)
	}
}
