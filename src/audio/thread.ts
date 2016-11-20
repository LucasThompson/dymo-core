import { DymoNode } from './node';
import { DymoSource } from './source';
import { DymoNavigator } from '../navigators/navigator';
import { SequentialNavigator } from '../navigators/sequential';
import { ONSET, LOOP } from '../globals/uris';

/**
 * Plays back a dymo using a navigator.
 * @constructor
 */
export class SchedulerThread {

	private audioContext;
	private dymoStore;
	private dymoUri;
	private navigator;
	private buffers;
	private convolverSend;
	private delaySend;
	private scheduleAheadTime;
	private fadeLength;
	private onChanged;
	private onEnded;

	private sources = new Map(); //dymo->list<source>
	private nodes = new Map(); //dymo->list<nodes>
	private nextSources;
	private timeoutID;
	private currentSources = new Map();
	private currentEndTime;
	private previousOnset;

	constructor(dymoStore, dymoUri, navigator, audioContext, buffers, convolverSend, delaySend,
			scheduleAheadTime, fadeLength, onChanged, onEnded) {
		this.audioContext = audioContext;
		this.dymoStore = dymoStore;
		this.dymoUri = dymoUri;
		this.navigator = navigator;
		this.buffers = buffers;
		this.convolverSend = convolverSend;
		this.delaySend = delaySend;
		this.scheduleAheadTime = scheduleAheadTime;
		this.fadeLength = fadeLength;
		this.onChanged = onChanged;
		this.onEnded = onEnded;

		if (!navigator) {
			navigator = new DymoNavigator(dymoUri, new SequentialNavigator(dymoUri));
		}

		//starts automatically
		this.recursivePlay();
	}

	hasDymo(uri) {
		var dymos = this.dymoStore.findAllObjectsInHierarchy(this.dymoUri);
		if (dymos.indexOf(uri)) {
			return true;
		}
	}

	getNavigator() {
		return navigator;
	}

	/*this.pause = function(dymo) {
		var dymos = dymo.getAllDymosInHierarchy();
		for (var i = 0, ii = dymos.length; i < ii; i++) {
			var currentSources = sources.get(dymos[i]);
			if (currentSources) {
				for (var j = 0; j < currentSources.length; j++) {
					currentSources[j].pause();
				}
			}
		}
	}*/

	stop(dymoUri) {
		var subDymoUris = this.dymoStore.findAllObjectsInHierarchy(dymoUri);
		for (var i = 0, ii = subDymoUris.length; i < ii; i++) {
			var currentSources = this.sources.get(subDymoUris[i]);
			if (currentSources) {
				for (var j = 0; j < currentSources.length; j++) {
					currentSources[j].stop();
				}
			}
			if (this.nextSources) {
				this.nextSources.delete(subDymoUris[i]);
				if (this.nextSources.size <= 0) {
					this.nextSources = undefined;
				}
			}
		}
	}

	getAllSources() {
		return this.sources;
	}

	/** @private returns the sources correponding to the given dymo */
	private getSources(dymo) {
		return this.sources.get(dymo);
	}

	private recursivePlay() {
		var previousSources = this.currentSources;
		//create sources and init
		this.currentSources = this.getNextSources();
		this.registerSources(this.currentSources);
		if (!this.previousOnset) {
			var previousSourceDymoUri = this.currentSources.keys().next().value;
			//TODO CURRENTLY ASSUMING ALL PARALLEL SOURCES HAVE SAME ONSET AND DURATION
			this.previousOnset = this.dymoStore.findParameterValue(previousSourceDymoUri, ONSET);
		}
		//calculate delay and schedule
		var delay = this.getCurrentDelay();
		var startTime = this.audioContext.currentTime+delay;
		this.currentSources.forEach(source => source.play(startTime));
		//stop automatically looping sources
		previousSources.forEach(source => {
			if (this.dymoStore.findParameterValue(source.getDymoUri(), LOOP)) {
				source.stop();
			}
		});
		setTimeout(() => this.onChanged(), delay);
		//create next sources and wait or end and reset
		this.nextSources = this.createNextSources();
		if (this.nextSources && this.nextSources.size > 0) {
			this.currentEndTime = this.getCurrentEndTime(startTime);
			var longestSource = this.currentEndTime[1];
			this.currentEndTime = this.currentEndTime[0];
			//smooth transition in case of a loop
			if (this.dymoStore.findParameterValue(longestSource.getDymoUri(), LOOP)) {
				this.currentEndTime -= this.fadeLength;
			}
			var wakeupTime = (this.currentEndTime-this.audioContext.currentTime-this.scheduleAheadTime)*1000;
			this.timeoutID = setTimeout(function() { this.recursivePlay(); }, wakeupTime);
		} else {
			this.currentEndTime = this.getCurrentEndTime(startTime);
			var wakeupTime = (this.currentEndTime-this.audioContext.currentTime)*1000;
			setTimeout(function() {
				this.endThreadIfNoMoreSources();
			}, wakeupTime+100);
		}
	}

	private getNextSources() {
		if (!this.nextSources) {
			//create first sources
			return this.createNextSources();
		} else {
			//switch to next sources
			return this.nextSources;
		}
	}

	private registerSources(newSources) {
		for (var dymoKey of newSources.keys()) {
			if (!this.sources.get(dymoKey)) {
				this.sources.set(dymoKey, []);
			}
			this.sources.get(dymoKey).push(newSources.get(dymoKey));
		}
	}

	private sourceEnded(source) {
		var sourceList = this.sources.get(source.getDymoUri());
		sourceList.splice(sourceList.indexOf(source), 1);
		if (sourceList.length <= 0) {
			this.sources.delete(source.getDymoUri());
		}
		this.onChanged();
		this.endThreadIfNoMoreSources();
	}

	private endThreadIfNoMoreSources() {
		if (this.sources.size == 0 && (!this.nextSources || this.nextSources.size == 0)) {
			window.clearTimeout(this.timeoutID);
			this.navigator.reset();
			//remove all nodes (TODO works well but COULD BE DONE SOMEWHERE ELSE FOR EVERY NODE THAT HAS NO LONGER ANYTHING ATTACHED TO INPUT..)
			var subDymoUris = this.dymoStore.findAllObjectsInHierarchy(this.dymoUri);
			for (var i = 0, ii = subDymoUris.length; i < ii; i++) {
				var currentNode = this.nodes.get(subDymoUris[i]);
				if (currentNode) {
					currentNode.removeAndDisconnect();
				}
			}
			if (this.onEnded) {
				this.onEnded();
			}
		}
	}

	private getCurrentDelay() {
		if (!this.currentEndTime) {
			return this.scheduleAheadTime;
		} else {
			return this.currentEndTime-this.audioContext.currentTime;
		}
	}

	private getCurrentEndTime(startTime) {
		if (this.nextSources) {
			var nextSourceDymoUri = this.nextSources.keys().next().value;
			//TODO CURRENTLY ASSUMING ALL PARALLEL SOURCES HAVE SAME ONSET AND DURATION
			var nextOnset = this.dymoStore.findParameterValue(nextSourceDymoUri, ONSET);
			var timeToNextOnset = nextOnset-this.previousOnset;
			this.previousOnset = nextOnset;
			if (!isNaN(nextOnset)) {
				return startTime+timeToNextOnset;
			}
		}
		var maxDuration = 0;
		var longestSource;
		this.currentSources.forEach(source => {
			var currentDuration = this.getSourceDuration(source);
			if (currentDuration > maxDuration) {
				maxDuration = currentDuration;
				longestSource = source;
			}
		});
		return [startTime+maxDuration, longestSource];
	}

	private getSourceDuration(source) {
		//var playbackRate = source.getDymo().getParameter(PLAYBACK_RATE).getValue();
		return source.getDuration();// /playbackRate;
	}

	private createNextSources() {
		var nextParts = this.navigator.getNextParts();
		if (nextParts) {
			this.logNextIndices(nextParts);
			var nextSources = new Map();
			for (var i = 0; i < nextParts.length; i++) {
				var sourcePath = this.dymoStore.getSourcePath(nextParts[i]);
				if (sourcePath) {
					var buffer = this.buffers[sourcePath];
					var newSource = new DymoSource(this.dymoStore, nextParts[i], this.audioContext, buffer, this.convolverSend, this.delaySend, this.fadeLength, this.sourceEnded);
					this.createAndConnectToNodes(newSource);
					nextSources.set(nextParts[i], newSource);
				}
			}
			return nextSources;
		}
	}

	private logNextIndices(nextParts) {
		console.log(nextParts.map(function(s){
			var index = this.dymoStore.findPartIndex(s);
			if (!isNaN(index)) {
				return index;
			} else {
				return "top";
			}
		}));
	}

	private createAndConnectToNodes(source) {
		var currentNode = source;
		var currentParentDymo = this.dymoStore.findParents(source.getDymoUri())[0];
		while (currentParentDymo) {
			//parent node already defined, so just connect and exit
			if (this.nodes.has(currentParentDymo)) {
				currentNode.connect(this.nodes.get(currentParentDymo).getInput());
				return;
			}
			//parent node doesn't exist, so create entire missing parent hierarchy
			var parentNode = new DymoNode(this.dymoStore, currentParentDymo, this.audioContext, this.convolverSend, this.delaySend);
			currentNode.connect(parentNode.getInput());
			this.nodes.set(currentParentDymo, parentNode);
			currentParentDymo = this.dymoStore.findParents(currentParentDymo)[0];
			currentNode = parentNode;
		}
		//no more parent, top dymo reached, connect to main output
		currentNode.connect(this.audioContext.destination);
	}

}
