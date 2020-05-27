package com.applicaster.ima

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import android.widget.RelativeLayout
import com.google.ads.interactivemedia.v3.api.AdPodInfo
import com.google.ads.interactivemedia.v3.api.player.AdMediaInfo
import com.google.ads.interactivemedia.v3.api.player.ContentProgressProvider
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer.VideoAdPlayerCallback
import com.google.ads.interactivemedia.v3.api.player.VideoProgressUpdate

/**
 * An example video player that implements VideoAdPlayer.
 */
class ImaAdsPlayer : RelativeLayout, VideoAdPlayer, ContentProgressProvider {
	private var videoView: ImaVideoPlayerView? = null
	private var adUiContainer: FrameLayout? = null

	constructor(context: Context?, attrs: AttributeSet?, defStyle: Int) : super(context, attrs, defStyle) {
		init()
	}

	constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {
		init()
	}

	constructor(context: Context?) : super(context) {
		init()
	}

	private fun init() {
		val videoLayoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
		videoLayoutParams.addRule(CENTER_HORIZONTAL)
		videoLayoutParams.addRule(CENTER_IN_PARENT)
		videoView = ImaVideoPlayerView(context)
		videoView?.layoutParams = videoLayoutParams
		addView(videoView, 0)
		adUiContainer = FrameLayout(context)
		val uiContainerParams = ViewGroup.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
		adUiContainer?.layoutParams = uiContainerParams
		addView(adUiContainer, 1)
	}

	val uiContainer: ViewGroup?
		get() = adUiContainer

	fun setCompletionCallback(callback: ImaVideoPlayerView.CompleteCallback?) {
		videoView?.setCompleteCallback(callback)
	}

	override fun addCallback(callback: VideoAdPlayerCallback) {
		videoView?.addCallback(callback)
	}

	override fun removeCallback(callback: VideoAdPlayerCallback) {
		videoView?.removeCallback(callback)
	}

	fun getVideo(): ImaVideoPlayerView? {
		return videoView
	}

	fun setVideo(video: ImaVideoPlayerView?) {
		this.videoView = video
	}

	override fun getContentProgress(): VideoProgressUpdate {
		val durationMs: Int = videoView?.duration ?: 0
		if (durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		return VideoProgressUpdate(videoView?.currentPosition?.toLong() ?: 0L, durationMs.toLong())
	}

	override fun getAdProgress(): VideoProgressUpdate {
		val durationMs: Int = videoView?.duration ?: 0
		if (durationMs <= 0) {
			return VideoProgressUpdate.VIDEO_TIME_NOT_READY
		}
		return VideoProgressUpdate(videoView?.currentPosition?.toLong() ?: 0L, durationMs.toLong())
	}

	override fun loadAd(adMediaInfo: AdMediaInfo, adPodInfo: AdPodInfo) {
		videoView?.setVideoPath(adMediaInfo.url)
		videoView?.setMediaInfo(adMediaInfo)
	}

	override fun pauseAd(adMediaInfo: AdMediaInfo) {
		videoView?.pause()
	}

	override fun playAd(adMediaInfo: AdMediaInfo) {
		videoView?.start()
	}

	override fun stopAd(adMediaInfo: AdMediaInfo) {
		videoView?.stopPlayback()
	}

	override fun release() {
		videoView?.stopPlayback()
	}

	override fun getVolume(): Int {
		return 100
	}
}
