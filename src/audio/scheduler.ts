import * as uris from '../globals/uris';
import { DymoStore } from '../io/dymostore';
import { SchedulerThread } from './thread';

/**
 * Manages playing back any number of dymos.
 * @constructor
 * @param {Function=} onPlaybackChange (optional)
 */
export class Scheduler {

	private dymoStore;
	private audioContext;
	private scheduleAheadTime;
	private fadeLength;
	private onPlaybackChange;

	private buffers = {};
	private threads = [];
	private urisOfPlayingDymos = [];

	private convolverSend;
	private delaySend;
	private numCurrentlyLoading = 0;

	constructor(dymoStore: DymoStore, audioContext, scheduleAheadTime, fadeLength, onPlaybackChange: Function) {
		this.dymoStore = dymoStore;
		this.audioContext = audioContext;
		this.scheduleAheadTime = scheduleAheadTime;
		this.fadeLength = fadeLength;
		this.onPlaybackChange = onPlaybackChange;
	}

	init(reverbFile: string, dymoUris: Array<string>, callback: Function) {
		//init horizontal listener orientation in degrees
		this.dymoStore.addParameter(null, uris.LISTENER_ORIENTATION, 0, self);
		this.loadBuffers(dymoUris, callback);
		//init reverb if needed
		if (reverbFile && this.dymoStore.find(null, null, uris.REVERB).length > 0) {
			this.convolverSend = this.audioContext.createConvolver();
			this.convolverSend.connect(this.audioContext.destination);
			this.loadAudio(reverbFile, function(buffer) {
				this.convolverSend.buffer = buffer;
				this.bufferLoaded(callback);
			});
		}
		//init delay if needed
		if (this.dymoStore.find(null, null, uris.DELAY).length > 0) {
			var delaySend = this.audioContext.createDelay();
			delaySend.delayTime.value = 0.5;
			delaySend.connect(this.audioContext.destination);
			var delayFeedback = this.audioContext.createGain();
			delayFeedback.gain.value = 0.6;
			delaySend.connect(delayFeedback);
			delayFeedback.connect(delaySend);
		}
		//start observing play parameters
		this.dymoStore.addTypeObserver(uris.PLAY, uris.VALUE, self);
	}

	/** @param {Array<string>} dymoUris */
	private loadBuffers(dymoUris: Array<string>, callback) {
		var allPaths = [];
		//console.log(this.dymoStore.find(null, HAS_PART).map(function(r){return r.subject + " " + r.object;}));
		for (var i = 0, ii = dymoUris.length; i < ii; i++) {
			var allSubDymos = this.dymoStore.findAllObjectsInHierarchy(dymoUris[i]);
			allPaths = allPaths.concat(allSubDymos.map(function(d){return this.dymoStore.getSourcePath(d)}));
		}
		for (var i = 0, ii = allPaths.length; i < ii; i++) {
			//only add if not there yet..
			if (allPaths[i] && !this.buffers[allPaths[i]]) {
				this.loadAudio(allPaths[i], function(buffer, path) {
					this.buffers[path] = buffer;
					this.bufferLoaded(callback);
				});
			}
		}
		if (this.numCurrentlyLoading == 0 && callback) {
			callback();
		}
	}

	getBuffer(dymoUri) {
		return this.buffers[this.dymoStore.getSourcePath(dymoUri)];
	}

	/** @param {Function=} callback (optional) */
	private bufferLoaded(callback) {
		if (this.numCurrentlyLoading > 0) {
			this.numCurrentlyLoading--;
		}
		if (this.numCurrentlyLoading == 0 && callback) {
			callback();
		}
	}

	updateNavigatorPosition(dymoUri, level, position) {
		for (var i = 0, ii = this.threads.length; i < ii; i++) {
			if (this.threads[i].hasDymo(dymoUri)) {
				this.threads[i].getNavigator().setPosition(position, level, dymoUri);
			}
		}
	}

	getNavigatorPosition(dymoUri, level) {
		for (var i = 0, ii = this.threads.length; i < ii; i++) {
			if (this.threads[i].hasDymo(dymoUri)) {
				return this.threads[i].getNavigator().getPosition(level, dymoUri);
			}
		}
	}

	//sync the first navigator for syncDymo to the position of the first for goalDymo on the given level
	syncNavigators(syncDymo, goalDymo, level) {
		var syncNav, goalNav;
		for (var i = 0, ii = this.threads.length; i < ii; i++) {
			if (this.threads[i].hasDymo(syncDymo)) {
				syncNav = this.threads[i].getNavigator();
			}
			if (this.threads[i].hasDymo(goalDymo)) {
				goalNav = this.threads[i].getNavigator();
			}
		}
		//only sync if goalNav already exists..
		if (goalNav) {
			var position = goalNav.getPosition(level, goalDymo);
			syncNav.setPosition(position, level, syncDymo);
		}
	}

	/** @param {Navigator=} navigator (optional) */
	play(dymoUri, navigator?) {
		var thread = new SchedulerThread(this.dymoStore, dymoUri, navigator, this.audioContext, this.buffers,
			this.convolverSend, this.delaySend, this.scheduleAheadTime, this.fadeLength, this.updatePlayingDymos, this.threadEnded);
		this.threads.push(thread);
	}

	pause(dymoUri) {
		if (dymoUri) {
			for (var i = 0; i < this.threads.length; i++) {
				this.threads[i].pause(dymoUri);
			}
		} else {

		}
	}

	stop(dymoUri) {
		if (dymoUri) {
			for (var i = 0; i < this.threads.length; i++) {
				this.threads[i].stop(dymoUri);
			}
		} else {

		}
	}

	/** @private returns all sources correponding to the given dymo */
	getSources(dymoUri) {
		var sources = [];
		for (var i = 0; i < this.threads.length; i++) {
			var currentSources = this.threads[i].getSources(dymoUri);
			if (currentSources) {
				for (var j = 0; j < currentSources.length; j++) {
					sources = sources.concat(currentSources);
				}
			}
		}
		return sources;
	}

	private threadEnded(thread) {
		this.threads.splice(this.threads.indexOf(thread), 1);
	}

	private updatePlayingDymos() {
		var uris = [];
		for (var i = 0; i < this.threads.length; i++) {
			for (var currentDymoUri of this.threads[i].getAllSources().keys()) {
				while (currentDymoUri != null) {
					if (uris.indexOf(currentDymoUri) < 0) {
						uris.push(currentDymoUri);
					}
					currentDymoUri = this.dymoStore.findParents(currentDymoUri)[0];
				}
			}
		}
		uris.sort();
		this.urisOfPlayingDymos = uris;
		if (this.onPlaybackChange) {
			this.onPlaybackChange(this.urisOfPlayingDymos);
		}
	}

	getUrisOfPlayingDymos() {
		return this.urisOfPlayingDymos;
	}

	observedValueChanged(paramUri, paramType, value) {
		if (paramType == uris.LISTENER_ORIENTATION) {
			var angleInRadians = value / 180 * Math.PI;
			this.audioContext.listener.setOrientation(Math.sin(angleInRadians), 0, -Math.cos(angleInRadians), 0, 1, 0);
		} else if (paramType == uris.PLAY) {
			var dymoUri = this.dymoStore.findSubject(uris.HAS_PARAMETER, paramUri);
			if (value > 0) {
				this.play(dymoUri);
			} else {
				this.stop(dymoUri);
			}
		}
	}

	private loadAudio(path, callback) {
		//console.log(path)
		this.numCurrentlyLoading++;
		var request = new XMLHttpRequest();
		request.open('GET', path, true);
		request.responseType = 'arraybuffer';
		request.onload = () => this.audioContext.decodeAudioData(request.response, buffer => callback(buffer, path));
		request.send();
	}

}
