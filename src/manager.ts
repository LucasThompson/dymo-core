import * as uris from './globals/uris';
import { DymoStore } from './io/dymostore';
import { DymoLoader } from './io/dymoloader';
import { Scheduler } from './audio/scheduler';
import { UIControl } from './controls/uicontrol';

/**
 * A class for easy access of all dymo core functionality.
 * @constructor
 * @param {Object=} $scope angular scope (optional, uicontrols will call $scope.$apply())
 * @param {Function=} onPlaybackChange (optional)
 */
export class DymoManager {

	private SCHEDULE_AHEAD_TIME: number = 0.1; //seconds
	private readonly FADE_LENGTH: number = 0.02; //seconds
	private readonly DYMO_ONTOLOGY_URI: string = "http://tiny.cc/dymo-ontology#";

	private dymoStore: DymoStore;
	private scheduler: Scheduler;
	private topDymos;
	private rendering;
	private uiControls = {};
	private sensorControls = {};

	private reverbFile;
	private $scope;

	constructor(audioContext, scheduleAheadTime, reverbFile, callback, $scope?: Object, onPlaybackChange?: Function) {
		this.reverbFile = reverbFile;
		this.$scope = $scope;
		this.dymoStore = new DymoStore(callback);
		this.scheduler = new Scheduler(this.dymoStore, audioContext, onPlaybackChange);
		if (!isNaN(scheduleAheadTime)) {
			this.SCHEDULE_AHEAD_TIME = scheduleAheadTime;
		}
	}

	loadDymoAndRenderingFromStore(newStore, buffersCallback) {
		var loader = new DymoLoader(newStore);
		this.processLoadedDymoAndRendering(loader.createDymoFromStore(), loader.createRenderingFromStore(), buffersCallback);
	}

	loadDymoAndRendering(dymoUri, renderingUri, dymoCallback, buffersCallback) {
		var loader = new DymoLoader(this.dymoStore);
		loader.loadDymoFromJson(dymoUri, function(loadedDymos) {
			loader.loadRenderingFromJson(renderingUri, function(loadedRendering) {
				this.processLoadedDymoAndRendering(loadedDymos, loadedRendering, buffersCallback);
				if (dymoCallback) {
					dymoCallback();
				}
			});
		});
	}

	private processLoadedDymoAndRendering(loadedDymos, loadedRendering, buffersCallback) {
		this.topDymos = loadedDymos;
		this.rendering = loadedRendering[0];
		for (var key in loadedRendering[1]) {
			var currentControl = loadedRendering[1][key];
			if (this.dymoStore.isSubclassOf(currentControl.getType(), uris.UI_CONTROL)) {
				this.uiControls[key] = new UIControl(currentControl, this.$scope);
			}
			if (this.dymoStore.isSubclassOf(currentControl.getType(), uris.SENSOR_CONTROL)) {
				this.sensorControls[key] = currentControl;
			}
		}
		if (!this.reverbFile) {
			this.reverbFile = 'bower_components/dymo-core/audio/impulse_rev.wav';
		}
		this.scheduler.init(this.reverbFile, loadedDymos, buffersCallback);
	}

	loadDymoFromJson(jsonDymo, callback) {
		var loader = new DymoLoader(this.dymoStore);
		loader.loadDymoFromJson(jsonDymo, callback);
	}

	parseDymoFromJson(jsonDymo, callback) {
		var loader = new DymoLoader(this.dymoStore);
		loader.parseDymoFromJson(jsonDymo, callback);
	}

	replacePartOfTopDymo(index, dymoUri) {
		var oldDymo = this.dymoStore.replacePartAt(this.topDymos[0], dymoUri, index);
		this.scheduler.stop(oldDymo);
	}

	updateNavigatorPosition(dymoUri, level, position) {
		this.scheduler.updateNavigatorPosition(dymoUri, level, position);
	}

	getNavigatorPosition(dymoUri, level) {
		return this.scheduler.getNavigatorPosition(dymoUri, level);
	}

	//sync the first navigator for syncDymo to the position of the first for goalDymo on the given level
	syncNavigators(syncDymo, goalDymo, level) {
		this.scheduler.syncNavigators(syncDymo, goalDymo, level);
	}

	startPlayingUri(dymoUri) {
		this.scheduler.play(dymoUri);
	}

	stopPlayingUri(dymoUri) {
		this.scheduler.stop(dymoUri);
	}

	startPlaying() {
		for (var i = 0; i < this.topDymos.length; i++) {
			this.dymoStore.updatePartOrder(this.topDymos[i], uris.ONSET);
			//topDymos[i].updatePartOrder(ONSET); //TODO WHERE TO PUT THIS??
			this.scheduler.play(this.topDymos[i], this.rendering.getNavigator());
		}
	}

	stopPlaying() {
		for (var i = 0; i < this.topDymos.length; i++) {
			this.scheduler.stop(this.topDymos[i]);
		}
	}

	getTopDymo() {
		return this.topDymos[0];
	}

	getRendering() {
		return this.rendering;
	}

	getUIControls() {
		return this.uiControls;
	}

	getUIControl(key) {
		return this.uiControls[key];
	}

	getSensorControls() {
		return this.sensorControls;
	}

}
