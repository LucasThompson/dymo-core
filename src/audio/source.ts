import { DymoNode } from './node';
import { DymoStore } from '../io/dymostore';
import { AudioProcessor } from './processor';
import { AMPLITUDE, PLAYBACK_RATE, TIME_STRETCH_RATIO, LOOP, TIME_FEATURE, DURATION_FEATURE, DURATION_RATIO } from '../globals/uris';

/**
 * Plays back a buffer and offers lots of changeable parameters.
 * @constructor
 * @extends {DymoNode}
 */
export class DymoSource extends DymoNode {

	private SHITTY_TIMESTRETCH_BUFFER_ZONE = 0.3; //seconds
	private fadeLength;

	private audioContext;
	private source;
	private buffer;
	private startTime;
	private endTime;
	private currentPausePosition = 0;
	private isPlaying;
	private isPaused;
	private duration;

	constructor(dymoStore: DymoStore, dymoUri: string, audioContext, buffer, reverbSend, delaySend, fadeLength, onEnded) {
		super(dymoStore, dymoUri, audioContext, reverbSend, delaySend);

		this.fadeLength = fadeLength;
		this.audioContext = audioContext;
		this.buffer = buffer;
		this.source = audioContext.createBufferSource();
		//var source = new AudioProcessorSource(audioContext, buffer, filter);

		this.source.connect(this.getInput());

		var segment = this.getSegment();
		this.duration = segment[1];
		var stretchRatio = this.getStretchRatio();
		this.source.buffer = this.getProcessedBuffer(segment, stretchRatio);

		this.addParameter(PLAYBACK_RATE, this.source.playbackRate);
		this.addParameter(TIME_STRETCH_RATIO, {value:0});
		this.addParameter(LOOP, {value:0});
	}

	private getSegment() {
		var segment = [this.dymoStore.findFeatureValue(this.dymoUri, TIME_FEATURE),
			this.dymoStore.findFeatureValue(this.dymoUri, DURATION_FEATURE)];
		if (!segment[0]) {
			segment[0] = 0;
		}
		if (!segment[1] && this.buffer) {
			segment[1] = this.buffer.duration-segment[0];
		}
		var durationRatio = this.dymoStore.findParameterValue(this.dymoUri, DURATION_RATIO);
		if (durationRatio && 0 < durationRatio && durationRatio < 1) {
			segment[1] *= durationRatio;
		}
		return segment;
	}

	private getStretchRatio() {
		var timeStretchRatio = this.dymoStore.findParameterValue(this.dymoUri, TIME_STRETCH_RATIO);
		if (timeStretchRatio) {
			return timeStretchRatio;
		}
		return 1; //TODO THIS SHOULD BE STANDARD VALUE FROM GRAPH STORE
	}

	private getProcessedBuffer(segment, stretchRatio) {
		var time = segment[0];
		var duration = segment[1];
		if (stretchRatio != 1) {
			//get too much cause of shitty timestretch algorithm
			duration += this.SHITTY_TIMESTRETCH_BUFFER_ZONE;
		} else {
			//add time for fade after source officially done
			duration += this.fadeLength;
		}
		if (!this.buffer && !isNaN(time+duration)) {
			//buffer doesn't exist, try to get from server
			this.requestBufferFromAudioServer(this.dymoStore.getSourcePath(this.dymoUri), time, time+duration, function(loadedBuffer) {
				return this.getStretchedAndFadedBuffer(loadedBuffer, duration, stretchRatio);
			});
		} else {
			//trim if buffer too long
			if (time != 0 || duration < this.buffer.duration) {
				this.buffer = this.getSubBuffer(this.buffer, this.toSamples(time, this.buffer), this.toSamples(duration, this.buffer));
			}
			return this.getStretchedAndFadedBuffer(this.buffer, duration, stretchRatio);
		}
	}

	private getStretchedAndFadedBuffer(buffer, duration, stretchRatio) {
		if (stretchRatio != 1) {
			buffer = new AudioProcessor(this.audioContext).timeStretch(buffer, stretchRatio);
			//trim it down again
			var shouldBeDuration = duration/stretchRatio;
			//add time for fade after source officially done
			buffer = this.getSubBuffer(buffer, 0, this.toSamples(shouldBeDuration+this.fadeLength, buffer));
			duration = shouldBeDuration;
		}
		this.fadeBuffer(buffer, buffer.length);
		return buffer;
	}

	getDuration() {
		return this.duration;
	}

	isLoopingAndPlaying() {
		return this.source.loop && this.isPlaying;
	}

	/** @param {number=} startTime (optional) */
	play(startTime?: number) {
		this.source.onended = function() {
			//disconnect all nodes
			this.source.disconnect();
			this.removeAndDisconnect();
			if (this.onEnded) {
				this.onEnded(self);
			}
		};
		if (!startTime) {
			startTime = 0;
		}
		if (this.dymoStore.findParameterValue(this.dymoUri, LOOP)) {
			this.source.loop = true;
		}
		this.source.start(startTime);
		//source.start(startTime, currentPausePosition);
		this.isPlaying = true;
	}

	pause() {
		if (this.isPlaying) {
			this.stopAndRemoveAudioSources();
			this.currentPausePosition += this.audioContext.currentTime - this.startTime;
			this.isPaused = true;
		} else if (this.isPaused) {
			this.isPaused = false;
			this.play();
		}
	}

	stop() {
		if (this.isPlaying) {
			this.stopAndRemoveAudioSources();
		}
		//even in case it is paused
		this.currentPausePosition = 0;
	}

	private stopAndRemoveAudioSources() {
		this.isPlaying = false;
		var now = this.audioContext.currentTime;
		this.parameters[AMPLITUDE].setValueAtTime(this.parameters[AMPLITUDE].value, now);
		this.parameters[AMPLITUDE].linearRampToValueAtTime(0, now+this.fadeLength);
		this.source.stop(now+2*this.fadeLength);
	}

	private toSamples(seconds, buffer) {
		if (seconds || seconds == 0) {
			return Math.round(seconds*buffer.sampleRate);
		}
	}

	private getSubBuffer(buffer, fromSample, durationInSamples) {
		//console.log(buffer, buffer.numberOfChannels, buffer.length, fromSample, durationInSamples, buffer.sampleRate)
		var samplesToCopy = Math.min(buffer.length-fromSample, durationInSamples);
		var subBuffer = this.audioContext.createBuffer(buffer.numberOfChannels, samplesToCopy, buffer.sampleRate);
		for (var i = 0; i < buffer.numberOfChannels; i++) {
			var currentCopyChannel = subBuffer.getChannelData(i);
			var currentOriginalChannel = buffer.getChannelData(i);
			for (var j = 0; j < samplesToCopy; j++) {
				currentCopyChannel[j] = currentOriginalChannel[fromSample+j];
			}
		}
		return subBuffer;
	}

	private fadeBuffer(buffer, durationInSamples) {
		var fadeSamples = buffer.sampleRate*this.fadeLength;
		for (var i = 0; i < buffer.numberOfChannels; i++) {
			var currentChannel = buffer.getChannelData(i);
			for (var j = 0.0; j < fadeSamples; j++) {
				currentChannel[j] *= j/fadeSamples;
				currentChannel[durationInSamples-j-1] *= j/fadeSamples;
			}
		}
	}

	private requestBufferFromAudioServer(filename, from, to, callback) {
		var index = filename.lastIndexOf('/');
		if (index) {
			filename = filename.substring(index+1);
		}
		var query = "http://localhost:8060/getAudioChunk?filename=" + filename + "&fromSecond=" + from + "&toSecond=" + to;
		this.loadAudio(query, function(buffer) {
			callback(buffer);
		});
	}

	//PUT IN AUDIO TOOLS OR SO!!! (duplicate in scheduler)
	private loadAudio(path, callback) {
		var request = new XMLHttpRequest();
		request.open('GET', path, true);
		request.responseType = 'arraybuffer';
		request.onload = () => {
			this.audioContext.decodeAudioData(request.response, function(buffer) {
				callback(buffer);
			}, function(err) {
				console.log('audio from server is faulty');
			});
		}
		request.send();
	}

}
