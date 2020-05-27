package com.applicaster.ima.ads

import android.content.Context
import android.util.AttributeSet
import android.util.Log
import android.view.ViewGroup
import android.widget.RelativeLayout
import com.google.ads.interactivemedia.v3.api.AdPodInfo
import com.google.ads.interactivemedia.v3.api.player.AdMediaInfo
import com.google.ads.interactivemedia.v3.api.player.ContentProgressProvider
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import com.google.ads.interactivemedia.v3.api.player.VideoProgressUpdate
import com.google.android.exoplayer2.ExoPlayer
import com.google.android.exoplayer2.Player
import com.google.android.exoplayer2.source.MediaSource
import com.google.android.exoplayer2.ui.PlayerView
import java.util.*

class VideoPlayerWithAdPlayback : RelativeLayout {
	// The wrapped video player.
	private var mVideoPlayer: Player? = null

	private var mediaSource: MediaSource? = null
	// A Timer to help track media updates
	private var timer: Timer? = null
	// Track the currently playing media file. If doing preloading, this will need to be an
// array or other data structure.
	private var adMediaInfo: AdMediaInfo? = null
	/** Returns the UI element for rendering video ad elements.  */
	// The SDK will render ad playback UI elements into this ViewGroup.
	var adUiContainer: ViewGroup? = null
		private set
	/** Returns if an ad is displayed.  */
	// Used to track if the current video is an ad (as opposed to a content video).
	var isAdDisplayed = false
		private set
	// Used to track the current content video URL to resume content playback.
	private var mContentVideoUrl: String? = null
	// The saved position in the ad to resume if app is backgrounded during ad playback.
	private var mSavedAdPosition = 0
	// The saved position in the content to resume to after ad playback or if app is backgrounded
// during content playback.
	private var mSavedContentPosition = 0
	// Used to track if the content has completed.
	private var contentHasCompleted = false
	/** Returns an implementation of the SDK's VideoAdPlayer interface.  */
	// VideoAdPlayer interface implementation for the SDK to send ad play/pause type events.
	var videoAdPlayer: VideoAdPlayer? = null
		private set
	// ContentProgressProvider interface implementation for the SDK to check content progress.
	var contentProgressProvider: ContentProgressProvider? = null
		private set
	private val mAdCallbacks: MutableList<VideoAdPlayer.VideoAdPlayerCallback> = ArrayList(1)

	constructor(context: Context?, attrs: AttributeSet?, defStyle: Int) : super(context, attrs, defStyle) {}
	constructor(context: Context?, attrs: AttributeSet?) : super(context, attrs) {}
	constructor(context: Context?) : super(context) {}

	override fun onFinishInflate() {
		super.onFinishInflate()
		init()
	}

	private fun startTracking() {
		if (timer != null) {
			return
		}
		timer = Timer()
		val updateTimerTask: TimerTask = object : TimerTask() {
			override fun run() { // Tell IMA the current video progress. A better implementation would be
// reactive to events from the media player, instead of polling.
				for (callback in mAdCallbacks) {
					callback.onAdProgress(adMediaInfo, videoAdPlayer?.adProgress)
				}
			}
		}
		val initialDelayMs = 250
		val pollingTimeMs = 250
		timer?.schedule(updateTimerTask, pollingTimeMs.toLong(), initialDelayMs.toLong())
	}

	private fun stopTracking() {
		if (timer != null) {
			timer?.cancel()
			timer = null
		}
	}

	private fun setPlayerView(playerView: PlayerView) {
		this.mVideoPlayer = playerView.player
		this.adUiContainer = playerView.adViewGroup
	}

	private fun setMediaSource(mediaSource: MediaSource) {
		this.mediaSource = mediaSource
	}

	private fun init() {
		isAdDisplayed = false
		contentHasCompleted = false
		mSavedAdPosition = 0
		mSavedContentPosition = 0
		// Define VideoAdPlayer connector.
		videoAdPlayer = object : VideoAdPlayer {
			override fun getVolume(): Int {
				return mVideoPlayer?.audioComponent?.volume?.toInt() ?: 100
			}

			override fun playAd(info: AdMediaInfo) {
				startTracking()
				if (isAdDisplayed) {
					mVideoPlayer?.playWhenReady = true
				} else {
					isAdDisplayed = true
					mVideoPlayer?.playWhenReady = true
				}
			}

			override fun loadAd(info: AdMediaInfo, api: AdPodInfo) {
				adMediaInfo = info
				isAdDisplayed = false
				mediaSource?.let { (mVideoPlayer as? ExoPlayer?)?.prepare(it) }
			}

			override fun stopAd(info: AdMediaInfo) {
				stopTracking()
				mVideoPlayer?.stop()
			}

			override fun pauseAd(info: AdMediaInfo) {
				stopTracking()
				mVideoPlayer?.playWhenReady = false
			}

			override fun release() { // any clean up that needs to be done
			}

			override fun addCallback(videoAdPlayerCallback: VideoAdPlayer.VideoAdPlayerCallback) {
				mAdCallbacks.add(videoAdPlayerCallback)
			}

			override fun removeCallback(videoAdPlayerCallback: VideoAdPlayer.VideoAdPlayerCallback) {
				mAdCallbacks.remove(videoAdPlayerCallback)
			}

			override fun getAdProgress(): VideoProgressUpdate {
				val durationMs: Int = mVideoPlayer?.contentDuration?.toInt() ?: 0
				if (durationMs <= 0) {
					return VideoProgressUpdate.VIDEO_TIME_NOT_READY
				}
				return VideoProgressUpdate(mVideoPlayer?.contentDuration ?: 0L, durationMs.toLong())
			}
		}
		contentProgressProvider = ContentProgressProvider {
			val durationMs: Int = mVideoPlayer?.contentDuration?.toInt() ?: 0
			if (durationMs <= 0) {
				VideoProgressUpdate.VIDEO_TIME_NOT_READY
			}
			VideoProgressUpdate(mVideoPlayer?.contentDuration ?: 0L, durationMs.toLong())
		}
		// Set player callbacks for delegating major video events.
//		mVideoPlayer.addPlayerCallback(
//				object : PlayerCallback() {
//					fun onPlay() {
//						if (isAdDisplayed) {
//							for (callback in mAdCallbacks) {
//								callback.onPlay(adMediaInfo)
//							}
//						}
//					}
//
//					fun onPause() {
//						if (isAdDisplayed) {
//							for (callback in mAdCallbacks) {
//								callback.onPause(adMediaInfo)
//							}
//						}
//					}
//
//					fun onResume() {
//						if (isAdDisplayed) {
//							for (callback in mAdCallbacks) {
//								callback.onResume(adMediaInfo)
//							}
//						}
//					}
//
//					fun onError() {
//						if (isAdDisplayed) {
//							for (callback in mAdCallbacks) {
//								callback.onError(adMediaInfo)
//							}
//						}
//					}
//
//					fun onCompleted() {
//						if (isAdDisplayed) {
//							for (callback in mAdCallbacks) {
//								callback.onEnded(adMediaInfo)
//							}
//						} else {
//							contentHasCompleted = true
//							// Alert an external listener that our content video is complete.
//							for (callback in mAdCallbacks) { //                callback.onContentComplete();
//							}
//						}
//					}
//				})
	}

	/** Set the path of the video to be played as content.  */
	fun setContentVideoPath(contentVideoUrl: String?) {
		mContentVideoUrl = contentVideoUrl
		contentHasCompleted = false
	}

	/**
	 * Save the playback progress state of the currently playing video. This is called when content is
	 * paused to prepare for ad playback or when app is backgrounded.
	 */
	fun savePosition() {
		if (isAdDisplayed) {
			mSavedAdPosition = mVideoPlayer?.contentPosition?.toInt() ?: 0
		} else {
			mSavedContentPosition = mVideoPlayer?.contentPosition?.toInt() ?: 0
		}
	}

	/**
	 * Restore the currently loaded video to its previously saved playback progress state. This is
	 * called when content is resumed after ad playback or when focus has returned to the app.
	 */
	fun restorePosition() {
		if (isAdDisplayed) {
			mVideoPlayer?.seekTo(mSavedAdPosition.toLong())
		} else {
			mVideoPlayer?.seekTo(mSavedContentPosition.toLong())
		}
	}

	/** Pauses the content video.  */
	fun pause() {
		mVideoPlayer?.playWhenReady = false
	}

	/** Plays the content video.  */
	fun play() {
		mVideoPlayer?.playWhenReady = true
	}

	/** Seeks the content video.  */
	fun seek(time: Int) { // Seek only if an ad is not playing. Save the content position either way.
		if (!isAdDisplayed) {
			mVideoPlayer?.seekTo(time.toLong())
		}
		mSavedContentPosition = time
	}

	/** Returns current content video play time.  */
	val currentContentTime: Int
		get() = if (isAdDisplayed) {
			mSavedContentPosition
		} else {
			mVideoPlayer?.currentPosition?.toInt() ?: 0
		}

	/**
	 * Pause the currently playing content video in preparation for an ad to play, and disables the
	 * media controller.
	 */
	fun pauseContentForAdPlayback() {
		savePosition()
	}

	/**
	 * Resume the content video from its previous playback progress position after an ad finishes
	 * playing. Re-enables the media controller.
	 */
	fun resumeContentAfterAdPlayback() {
		if (mContentVideoUrl == null || mContentVideoUrl!!.isEmpty()) {
			Log.w("ImaExample", "No content URL specified.")
			return
		}
		isAdDisplayed = false
		mVideoPlayer?.playWhenReady = true
		mVideoPlayer?.seekTo(mSavedContentPosition.toLong())
		mediaSource?.let { (mVideoPlayer as? ExoPlayer?)?.prepare(it) }
		if (contentHasCompleted) {
			mVideoPlayer?.playWhenReady = false
		}
	}

}
