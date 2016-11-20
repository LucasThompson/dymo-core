import { DymoStore } from '../io/dymostore';

export module Globals {
  var SCHEDULE_AHEAD_TIME: number = 0.1; //seconds
  var FADE_LENGTH: number = 0.02; //seconds
  const DYMO_ONTOLOGY_URI: string = "http://tiny.cc/dymo-ontology#";

  var DYMO_STORE: DymoStore;
}
