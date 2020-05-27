package com.applicaster.ima.ads

import android.annotation.SuppressLint
import android.content.Context
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.google.ads.interactivemedia.v3.api.*

class VideoPlayerController(
		context: Context?,
		videoPlayerWithAdPlayback: VideoPlayerWithAdPlayback,
		playPauseToggle: View,
		language: String?,
		companionViewGroup: ViewGroup,
		log: Logger?) {
	/** Log interface, so we can output the log commands to the UI or similar.  */
	interface Logger {
		fun log(logMessage: String?)
	}

	// Container with references to video player and ad UI ViewGroup.
	private var mAdDisplayContainer: AdDisplayContainer?
	// The AdsLoader instance exposes the requestAds method.
	private val mAdsLoader: AdsLoader
	// AdsManager exposes methods to control ad playback and listen to ad events.
	private var mAdsManager: AdsManager? = null
	// Factory class for creating SDK objects.
	private val mSdkFactory: ImaSdkFactory
	// Ad-enabled video player.
	private val mVideoPlayerWithAdPlayback: VideoPlayerWithAdPlayback = videoPlayerWithAdPlayback
	/** Set the ad tag URL the player should use to request ads when playing a content video.  */
	// VAST ad tag URL to use when requesting ads during video playback.
	var adTagUrl: String? = null
	// URL of content video.
	var contentVideoUrl: String? = null
		private set
	// ViewGroup to render an associated companion ad into.
	private val mCompanionViewGroup: ViewGroup
	// Tracks if the SDK is playing an ad, since the SDK might not necessarily use the video
// player provided to play the video ad.
	private var mIsAdPlaying: Boolean
	// View that handles taps to toggle ad pause/resume during video playback.
	private val mPlayPauseToggle: View
	// View that we can write log messages to, to display in the UI.
	private val mLog: Logger?
	private var mPlayAdsAfterTime = -1.0
	private var mVideoStarted = false

	// Inner class implementation of AdsLoader.AdsLoaderListener.
	private inner class AdsLoadedListener : AdsLoader.AdsLoadedListener {
		/** An event raised when ads are successfully loaded from the ad server via AdsLoader.  */
		override fun onAdsManagerLoaded(adsManagerLoadedEvent: AdsManagerLoadedEvent) { // Ads were successfully loaded, so get the AdsManager instance. AdsManager has
// events for ad playback and errors.
			mAdsManager = adsManagerLoadedEvent.adsManager
			// Attach event and error event listeners.
			mAdsManager?.addAdErrorListener(
					AdErrorEvent.AdErrorListener { adErrorEvent ->
						/** An event raised when there is an error loading or playing ads.  */
						log("Ad Error: " + adErrorEvent.error.message)
						resumeContent()
					})
			mAdsManager?.addAdEventListener(
					AdEvent.AdEventListener { adEvent ->
						/** Responds to AdEvents.  */
						log("Event: " + adEvent.type)
						when (adEvent.type) {
							AdEvent.AdEventType.LOADED ->  // AdEventType.LOADED will be fired when ads are ready to be
								// played. AdsManager.start() begins ad playback. This method is
								// ignored for VMAP or ad rules playlists, as the SDK will
								// automatically start executing the playlist.
								mAdsManager?.start()
							AdEvent.AdEventType.CONTENT_PAUSE_REQUESTED ->  // AdEventType.CONTENT_PAUSE_REQUESTED is fired immediately before
								// a video ad is played.
								pauseContent()
							AdEvent.AdEventType.CONTENT_RESUME_REQUESTED ->  // AdEventType.CONTENT_RESUME_REQUESTED is fired when the ad is
								// completed and you should start playing your content.
								resumeContent()
							AdEvent.AdEventType.PAUSED -> mIsAdPlaying = false
							AdEvent.AdEventType.RESUMED -> mIsAdPlaying = true
							AdEvent.AdEventType.ALL_ADS_COMPLETED -> {
								mAdsManager?.destroy()
								mAdsManager = null
							}
							else -> {
							}
						}
					})
			val adsRenderingSettings = ImaSdkFactory.getInstance().createAdsRenderingSettings()
			adsRenderingSettings.setPlayAdsAfterTime(mPlayAdsAfterTime)
			mAdsManager?.init(adsRenderingSettings)
			seek(mPlayAdsAfterTime)
			mVideoStarted = true
		}
	}

	private fun log(message: String) {
		mLog?.log(message + "\n")
	}

	private fun pauseContent() {
		mVideoPlayerWithAdPlayback.pauseContentForAdPlayback()
		mIsAdPlaying = true
		setPlayPauseOnAdTouch()
	}

	private fun resumeContent() {
		mVideoPlayerWithAdPlayback.resumeContentAfterAdPlayback()
		mIsAdPlaying = false
		removePlayPauseOnAdTouch()
	}

	/** Request and subsequently play video ads from the ad server.  */
	fun requestAndPlayAds(playAdsAfterTime: Double) {
		if (adTagUrl == null || adTagUrl === "") {
			log("No VAST ad tag URL specified")
			resumeContent()
			return
		}
		// Since we're switching to a new video, tell the SDK the previous video is finished.
		mAdsManager?.destroy()
		mAdsLoader.contentComplete()
		// Create the ads request.
		val request = mSdkFactory.createAdsRequest()
		request.adTagUrl = adTagUrl
		request.contentProgressProvider = mVideoPlayerWithAdPlayback.contentProgressProvider
		mPlayAdsAfterTime = playAdsAfterTime
		// Request the ad. After the ad is loaded, onAdsManagerLoaded() will be called.
		mAdsLoader.requestAds(request)
	}

	/** Touch to toggle play/pause during ad play instead of seeking.  */
	@SuppressLint("ClickableViewAccessibility")
	private fun setPlayPauseOnAdTouch() { // Use AdsManager pause/resume methods instead of the video player pause/resume methods
// in case the SDK is using a different, SDK-created video player for ad playback.
		mPlayPauseToggle.setOnTouchListener { _, event ->
			// If an ad is playing, touching it will toggle playback.
			if (event.action == MotionEvent.ACTION_DOWN) {
				if (mIsAdPlaying) {
					mAdsManager?.pause()
				} else {
					mAdsManager?.resume()
				}
				true
			} else {
				false
			}
		}
	}

	/** Remove the play/pause on touch behavior.  */
	private fun removePlayPauseOnAdTouch() {
		mPlayPauseToggle.setOnTouchListener(null)
	}

	/**
	 * Set metadata about the content video. In more complex implementations, this might more than
	 * just a URL and could trigger additional decisions regarding ad tag selection.
	 */
	fun setContentVideo(videoPath: String?) {
		mVideoPlayerWithAdPlayback.setContentVideoPath(videoPath)
		contentVideoUrl = videoPath
	}

	/**
	 * Save position of the video, whether content or ad. Can be called when the app is paused, for
	 * example.
	 */
	fun pause() {
		mVideoPlayerWithAdPlayback.savePosition()
		if (mVideoPlayerWithAdPlayback.isAdDisplayed) {
			mAdsManager?.pause()
		} else {
			mVideoPlayerWithAdPlayback.pause()
		}
	}

	/**
	 * Restore the previously saved progress location of the video. Can be called when the app is
	 * resumed.
	 */
	fun resume() {
		mVideoPlayerWithAdPlayback.restorePosition()
		if (mVideoPlayerWithAdPlayback.isAdDisplayed) {
			mAdsManager?.resume()
		} else {
			mVideoPlayerWithAdPlayback.play()
		}
	}

	fun destroy() {
		mAdsManager?.destroy()
		mAdsManager = null
		mAdDisplayContainer?.destroy()
		mAdDisplayContainer = null
	}

	/** Seeks to time in content video in seconds.  */
	fun seek(time: Double) {
		mVideoPlayerWithAdPlayback.seek((time * 1000.0).toInt())
	}

	/** Returns the current time of the content video in seconds.  */
	val currentContentTime: Double
		get() = mVideoPlayerWithAdPlayback.currentContentTime / 1000.0

	fun hasVideoStarted(): Boolean {
		return mVideoStarted
	}

	init {
		mPlayPauseToggle = playPauseToggle
		mIsAdPlaying = false
		mCompanionViewGroup = companionViewGroup
		mLog = log
		// Create an AdsLoader and optionally set the language.
		mSdkFactory = ImaSdkFactory.getInstance()
		val imaSdkSettings = mSdkFactory.createImaSdkSettings()
		imaSdkSettings.language = language
		mAdDisplayContainer = ImaSdkFactory.createAdDisplayContainer(
				mVideoPlayerWithAdPlayback.adUiContainer,
				mVideoPlayerWithAdPlayback.videoAdPlayer)
		mAdsLoader = mSdkFactory.createAdsLoader(context, imaSdkSettings, mAdDisplayContainer)
		mAdsLoader.addAdErrorListener { adErrorEvent ->
			/** An event raised when there is an error loading or playing ads.  */
			log("Ad Error: " + adErrorEvent.error.message)
			resumeContent()
		}
		mAdsLoader.addAdsLoadedListener(AdsLoadedListener())
	}
}
