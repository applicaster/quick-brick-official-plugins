package com.applicaster.ima

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaPlayer.OnCompletionListener
import android.media.MediaPlayer.OnPreparedListener
import android.widget.VideoView
import com.google.ads.interactivemedia.v3.api.player.AdMediaInfo
import com.google.ads.interactivemedia.v3.api.player.VideoAdPlayer
import java.util.*

/**
 * A VideoView that intercepts various methods and reports them back to a set of
 * VideoAdPlayerCallbacks.
 */
class ImaVideoPlayerView(context: Context) : VideoView(context), OnCompletionListener, MediaPlayer.OnErrorListener {
	/** Interface for alerting caller of video completion.  */
	interface CompleteCallback {
		fun onComplete()
	}

	private enum class PlaybackState {
		STOPPED,
		PAUSED,
		PLAYING
	}

	init {
		super.setOnCompletionListener(this)
		super.setOnErrorListener(this)
	}

	private val adCallbacks: MutableList<VideoAdPlayer.VideoAdPlayerCallback> = ArrayList(1)
	private var completeCallback: CompleteCallback? = null
	private var state = PlaybackState.STOPPED
	private var adMediaInfo: AdMediaInfo? = null
	fun setMediaInfo(adMediaInfo: AdMediaInfo?) {
		this.adMediaInfo = adMediaInfo
	}

	fun setCompleteCallback(callback: CompleteCallback?) {
		completeCallback = callback
	}

	override fun start() {
		super.start()
		val oldState = state
		state = PlaybackState.PLAYING
		when (oldState) {
			PlaybackState.STOPPED -> for (callback in adCallbacks) {
				callback.onPlay(adMediaInfo)
			}
			PlaybackState.PAUSED -> for (callback in adCallbacks) {
				callback.onResume(adMediaInfo)
			}
			else -> {
			}
		}
	}

	override fun pause() {
		super.pause()
		state = PlaybackState.PAUSED
		for (callback in adCallbacks) {
			callback.onPause(adMediaInfo)
		}
	}

	override fun stopPlayback() {
		super.stopPlayback()
		onStop()
	}

	private fun onStop() {
		state = PlaybackState.STOPPED
	}

	override fun onError(mp: MediaPlayer, what: Int, extra: Int): Boolean {
		for (callback in adCallbacks) {
			callback.onError(adMediaInfo)
		}
		onStop()
		// Returning true signals to MediaPlayer that we handled the error. This will prevent the
// completion handler from being called.
		return true
	}

	override fun onCompletion(mp: MediaPlayer) {
		onStop()
		for (callback in adCallbacks) {
			callback.onEnded(adMediaInfo)
		}
		completeCallback?.onComplete()
	}

	fun addCallback(callback: VideoAdPlayer.VideoAdPlayerCallback) {
		adCallbacks.add(callback)
	}

	fun removeCallback(callback: VideoAdPlayer.VideoAdPlayerCallback?) {
		adCallbacks.remove(callback)
	}

	override fun setOnCompletionListener(l: OnCompletionListener) {
		throw UnsupportedOperationException()
	}

	override fun setOnPreparedListener(l: OnPreparedListener) {
		super.setOnPreparedListener(l)
	}
}