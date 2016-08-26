var RDFS_URI = "http://www.w3.org/2000/01/rdf-schema#";
var CONTEXT_URI = "http://tiny.cc/dymo-context/";
var TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
var NAME = "http://schema.org/name";
var CDT = "http://tiny.cc/charm-ontology#cdt";
var ADT = "http://tiny.cc/charm-ontology#adt";
var VALUE = "http://tiny.cc/charm-ontology#value";
var HAS_PART = "http://tiny.cc/charm-ontology#hasPart";
var DYMO = "http://tiny.cc/dymo-ontology#Dymo";
var DYMO_TYPE = "http://tiny.cc/dymo-ontology#DymoType";
var CONJUNCTION = "http://tiny.cc/dymo-ontology#Conjunction";
var DISJUNCTION = "http://tiny.cc/dymo-ontology#Disjunction";
var SEQUENCE = "http://tiny.cc/dymo-ontology#Sequence";
var FEATURE = "http://tiny.cc/dymo-ontology#Feature";
var PARAMETER = "http://tiny.cc/dymo-ontology#Parameter";
var FEATURE_TYPE = "http://tiny.cc/dymo-ontology#FeatureType";
var PARAMETER_TYPE = "http://tiny.cc/dymo-ontology#ParameterType";
var LEVEL_FEATURE = "http://tiny.cc/dymo-ontology#LevelFeature";
var INDEX_FEATURE = "http://tiny.cc/dymo-ontology#IndexFeature";
var ONSET_FEATURE = "http://tiny.cc/dymo-ontology#OnsetFeature";
var DURATION_FEATURE = "http://tiny.cc/dymo-ontology#DurationFeature";
var CUSTOM_FEATURE = "http://tiny.cc/dymo-ontology#CustomFeature";
var AUDIO_PARAMETER = "http://tiny.cc/dymo-ontology#AudioParameter";
var HAS_STANDARD_VALUE = "http://tiny.cc/dymo-ontology#hasStandardValue";
var IS_INTEGER = "http://tiny.cc/dymo-ontology#isInteger";
var PLAY = "http://tiny.cc/dymo-ontology#Play";
var LOOP = "http://tiny.cc/dymo-ontology#Loop";
var ONSET = "http://tiny.cc/dymo-ontology#Onset";
var DURATION_RATIO = "http://tiny.cc/dymo-ontology#DurationRatio";
var AMPLITUDE = "http://tiny.cc/dymo-ontology#Amplitude";
var PLAYBACK_RATE = "http://tiny.cc/dymo-ontology#PlaybackRate";
var TIME_STRETCH_RATIO = "http://tiny.cc/dymo-ontology#TimeStretchRatio";
var PAN = "http://tiny.cc/dymo-ontology#Pan";
var DISTANCE = "http://tiny.cc/dymo-ontology#Distance";
var HEIGHT = "http://tiny.cc/dymo-ontology#Height";
var REVERB = "http://tiny.cc/dymo-ontology#Reverb";
var DELAY = "http://tiny.cc/dymo-ontology#Delay";
var FILTER = "http://tiny.cc/dymo-ontology#Filter";
var STRUCTURAL_PARAMETER = "http://tiny.cc/dymo-ontology#StructuralParameter";
var PART_COUNT = "http://tiny.cc/dymo-ontology#PartCount";
var PART_DURATION_RATIO = "http://tiny.cc/dymo-ontology#PartDurationRatio";
var PART_PROPORTION = "http://tiny.cc/dymo-ontology#PartProportion";
var CUSTOM_PARAMETER = "http://tiny.cc/dymo-ontology#CustomParameter";
var HAS_SOURCE = "http://tiny.cc/dymo-ontology#hasSource";
var HAS_PARAMETER = "http://tiny.cc/dymo-ontology#hasParameter";
var HAS_FEATURE = "http://tiny.cc/dymo-ontology#hasFeature";
var HAS_PARAMETER_TYPE = "http://tiny.cc/dymo-ontology#hasParameterType";
var HAS_FEATURE_TYPE = "http://tiny.cc/dymo-ontology#hasFeatureType";
var HAS_SIMILAR = "http://tiny.cc/dymo-ontology#hasSimilar";
var RENDERING = "http://tiny.cc/mobile-audio-ontology#Rendering";
var MAPPING = "http://tiny.cc/mobile-audio-ontology#Mapping";
var FUNCTION = "http://tiny.cc/mobile-audio-ontology#Function";
var MOBILE_CONTROL = "http://tiny.cc/mobile-audio-ontology#MobileControl";
var SENSOR_CONTROL = "http://tiny.cc/mobile-audio-ontology#SensorControl";
var UI_CONTROL = "http://tiny.cc/mobile-audio-ontology#UiControl";
var AUTO_CONTROL = "http://tiny.cc/mobile-audio-ontology#AutoControl";
var ACCELEROMETER_X = "http://tiny.cc/mobile-audio-ontology#AccelerometerX";
var ACCELEROMETER_Y = "http://tiny.cc/mobile-audio-ontology#AccelerometerY";
var ACCELEROMETER_Z = "http://tiny.cc/mobile-audio-ontology#AccelerometerZ";
var TILT_X = "http://tiny.cc/mobile-audio-ontology#TiltX";
var TILT_Y = "http://tiny.cc/mobile-audio-ontology#TiltY";
var TILT_Z = "http://tiny.cc/mobile-audio-ontology#TiltZ";
var GEOLOCATION_LATITUDE = "http://tiny.cc/mobile-audio-ontology#GeolocationLatitude";
var GEOLOCATION_LONGITUDE = "http://tiny.cc/mobile-audio-ontology#GeolocationLongitude";
var GEOLOCATION_DISTANCE = "http://tiny.cc/mobile-audio-ontology#GeolocationDistance";
var COMPASS_HEADING = "http://tiny.cc/mobile-audio-ontology#CompassHeading";
var BEACON = "http://tiny.cc/mobile-audio-ontology#Beacon";
var SLIDER = "http://tiny.cc/mobile-audio-ontology#Slider";
var TOGGLE = "http://tiny.cc/mobile-audio-ontology#Toggle";
var BUTTON = "http://tiny.cc/mobile-audio-ontology#Button";
var CUSTOM_CONTROL = "http://tiny.cc/mobile-audio-ontology#CustomControl";
var RANDOM = "http://tiny.cc/mobile-audio-ontology#Random";
var BROWNIAN = "http://tiny.cc/mobile-audio-ontology#Brownian";
var RAMP = "http://tiny.cc/mobile-audio-ontology#Ramp";
var MOBILE_PARAMETER = "http://tiny.cc/mobile-audio-ontology#MobileParameter";
var GLOBAL_PARAMETER = "http://tiny.cc/mobile-audio-ontology#GlobalParameter";
var CONTROL_PARAMETER = "http://tiny.cc/mobile-audio-ontology#ControlParameter";
var LISTENER_ORIENTATION = "http://tiny.cc/mobile-audio-ontology#ListenerOrientation";
var AUTO_CONTROL_FREQUENCY = "http://tiny.cc/mobile-audio-ontology#AutoControlFrequency";
var AUTO_CONTROL_TRIGGER = "http://tiny.cc/mobile-audio-ontology#AutoControlTrigger";
var BROWNIAN_MAX_STEP_SIZE = "http://tiny.cc/mobile-audio-ontology#BrownianMaxStepSize";
var LEAPING_PROBABILITY = "http://tiny.cc/mobile-audio-ontology#LeapingProbability";
var CONTINUE_AFTER_LEAPING = "http://tiny.cc/mobile-audio-ontology#ContinueAfterLeaping";
var NAVIGATOR = "http://tiny.cc/mobile-audio-ontology#Navigator";
var ONE_SHOT_NAVIGATOR = "http://tiny.cc/mobile-audio-ontology#OneShotNavigator";
var SEQUENTIAL_NAVIGATOR = "http://tiny.cc/mobile-audio-ontology#SequentialNavigator";
var SIMILARITY_NAVIGATOR = "http://tiny.cc/mobile-audio-ontology#SimilarityNavigator";
var DOMAIN_DIMENSION = "http://tiny.cc/mobile-audio-ontology#DomainDimension";
var MAPPING_TARGET = "http://tiny.cc/mobile-audio-ontology#MappingTarget";
var MAPPING_RANGE = "http://tiny.cc/mobile-audio-ontology#MappingRange";
var MAPPING_OWNERS = "http://tiny.cc/mobile-audio-ontology#MappingOwners";
var HAS_DYMO = "http://tiny.cc/mobile-audio-ontology#hasDymo";
var HAS_MAPPING = "http://tiny.cc/mobile-audio-ontology#hasMapping";
var HAS_DOMAIN_DIMENSION = "http://tiny.cc/mobile-audio-ontology#hasDomainDimension";
var HAS_FUNCTION = "http://tiny.cc/mobile-audio-ontology#hasFunction";
var HAS_ARGUMENT = "http://tiny.cc/mobile-audio-ontology#hasArgument";
var HAS_BODY = "http://tiny.cc/mobile-audio-ontology#hasBody";
var TO_TARGET = "http://tiny.cc/mobile-audio-ontology#toTarget";
var HAS_RANGE = "http://tiny.cc/mobile-audio-ontology#hasRange";
var IS_RELATIVE = "http://tiny.cc/mobile-audio-ontology#isRelative";
var HAS_INITIAL_VALUE = "http://tiny.cc/mobile-audio-ontology#hasInitialValue";
var IS_SMOOTH = "http://tiny.cc/mobile-audio-ontology#isSmooth";
var IS_AVERAGE_OF = "http://tiny.cc/mobile-audio-ontology#isAverageOf";
var HAS_UUID = "http://tiny.cc/mobile-audio-ontology#hasUuid";
var HAS_MAJOR = "http://tiny.cc/mobile-audio-ontology#hasMajor";
var HAS_MINOR = "http://tiny.cc/mobile-audio-ontology#hasMinor";
var HAS_DURATION = "http://tiny.cc/mobile-audio-ontology#hasDuration";
var HAS_NAVIGATOR = "http://tiny.cc/mobile-audio-ontology#hasNavigator";
var TO_DYMO = "http://tiny.cc/mobile-audio-ontology#toDymo";
