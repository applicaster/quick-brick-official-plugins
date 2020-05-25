package com.applicaster.ima

import android.content.Context
import android.net.Uri
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
import com.google.android.exoplayer2.source.ads.AdsLoader
import com.google.android.exoplayer2.source.ads.AdsMediaSource
import com.google.android.exoplayer2.ui.DefaultTimeBar
import com.google.android.exoplayer2.ui.PlayerView
import com.google.android.exoplayer2.upstream.DefaultDataSourceFactory
import com.google.android.exoplayer2.util.Util as exoUtil


class QuickBrickGoogleIMA : PlayerReceiverPlugin, Player.EventListener, AdErrorEvent.AdErrorListener {

	override fun onAdError(p: AdErrorEvent?) {
		logData(p.toString())
	}

	private val tag = "QuickBrickGoogleIMA"

	private var context: Context? = null
	private var player: ExoPlayer? = null
	private var playerView: PlayerView? = null
	private var playerTimeBar: DefaultTimeBar? = null
	private var imaLoader: AdsLoader? = null
	private var entry: Map<String, Any>? = null
	private var mediaSource: MediaSource? = null
	private var ads: Ad = Ad.Empty
	private var nextQuePointPosition = 0

	init {
		logData("init $tag")
	}

	override fun playerDidFinishPlayItem(player: PlayerSenderPlugin) {
		logData("playerDidFinishPlayItem")
		imaLoader?.release()
	}

	override fun playerDidCreate(player: PlayerSenderPlugin) {
		logData("playerDidCreate")

		// Set init data
		initPlayer(player)


		this.player?.playWhenReady = true

		// init IMA ads loader
		initImaLoader()

		// Creates ads media source

		val adsMediaSource = adsMediaSource(this.mediaSource, createDefaultDataSourceFactory())

		this.player?.prepare(adsMediaSource)
	}

	private fun initImaLoader() {
		when (ads) {
			is Ad.Vast -> initImaVastLoader()
			is Ad.Vmap -> initImaAdsLoader()
			Ad.Empty -> Uri.EMPTY
		}
	}

	private fun initImaAdsLoader() {
		this.context?.let {
			this.imaLoader = ZappImaAdsLoader.Builder(it)
					.setMediaLoadTimeoutMs(10_000)
					.setVastLoadTimeoutMs(10_000)
					.buildForAdTag(Uri.parse("https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpostonly&cmsid=496&vid=short_onecue&correlator="))
		}
		this.imaLoader?.setPlayer(this.player)
	}

	private fun initImaVastLoader() {
		this.context?.let {
//			this.imaLoader = ImaVastLoader(it)
			this.imaLoader = ZappImaVastLoader.Builder(it)
					.setMediaLoadTimeoutMs(10_000)
					.setVastLoadTimeoutMs(10_000)
					.buildForCuePoints(getVastCuePoints())
		}
		this.imaLoader?.setPlayer(this.player)
	}

	private fun adsMediaSource(
			mediaSource: MediaSource?,
			defaultDataSourceFactory: DefaultDataSourceFactory) = AdsMediaSource(
			mediaSource,
			defaultDataSourceFactory,
			this.imaLoader,
			this.playerView)

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
		this.imaLoader?.release()
	}

	override fun playerProgressUpdate(player: PlayerSenderPlugin, currentTime: Long, duration: Long) {
		logData("playerProgressUpdate")

	}

	override fun onTimelineChanged(timeline: Timeline, reason: Int) {
		logData("onTimelineChanged")
	}

	override fun receiveEvent(eventName: String, sender: SenderPlugin) {
		logData("receiveEvent => eventName: $eventName, sender: ${sender.dependencyType}")
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
