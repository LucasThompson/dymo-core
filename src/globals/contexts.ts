export const DYMO_CONTEXT = {
	"@context": {
		"@base": "http://tiny.cc/dymo-context/",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"owl": "http://www.w3.org/2002/07/owl#",
		"sch": "http://schema.org/",
		"mo": "http://purl.org/ontology/mo/",
		"mt": "http://purl.org/ontology/studio/multitrack#",
		"ch": "http://tiny.cc/charm-ontology#",
		"dy": "http://tiny.cc/dymo-ontology#",
		"mb": "http://tiny.cc/mobile-audio-ontology#",
		"ex": "http://tiny.cc/expression-ontology#",
		"value": "rdf:value",
		"name": "sch:name",
		"cdt": { "@id": "ch:cdt", "@type": "@vocab" },
		"adt": { "@id": "ch:adt", "@type": "@vocab" },
		"parts": "ch:hasPart",
		"Expression": "ex:Expression",
		"directed": { "@id": "ex:directed", "@type": "xsd:boolean" },
		"Variable": "ex:Variable",
		"varName": { "@id": "ex:varName", "@type": "xsd:string" },
		"varType": { "@id": "ex:varType", "@type": "@vocab" },
		"varExpr": { "@id": "ex:varExpr", "@type": "@vocab" },
		"varValue": { "@id": "ex:varValue", "@type": "@vocab" },
		"Constant": "ex:Constant",
		"Quantifier": "ex:Quantifier",
		"ForAll": "ex:ForAll",
		"ThereExists": "ex:ThereExists",
		"vars": "ex:vars",
		"body": "ex:body",
		"Accessor": "ex:Accessor",
		"object": { "@id": "ex:object", "@type": "xsd:string" },
		"property": { "@id": "ex:property", "@type": "xsd:string" },
		"FunctionalTerm": "ex:FunctionalTerm",
		"NamedFunction": "ex:NamedFunction",
		"PropertyFunction": "ex:PropertyFunction",
		"prop": { "@id": "ex:prop", "@type": "@vocab" },
		"Function": "ex:Function",
		"func": "ex:func",
		"args": "ex:args",
		"Conditional": "ex:Conditional",
		"antecedent": "ex:antecedent",
		"consequent": "ex:consequent",
		"alternative": "ex:alternative",
		"BinaryOperator": "ex:BinaryOperator",
		"left": "ex:left",
		"right": "ex:right",
		"RelationalOperator": "ex:RelationalOperator",
		"EqualTo": "ex:EqualTo",
		"NotEqualTo": "ex:NotEqualTo",
		"GreaterThan": "ex:GreaterThan",
		"LessThan": "ex:LessThan",
		"GreaterThanOrEqualTo": "ex:GreaterThanOrEqualTo",
		"LessThanOrEqualTo": "ex:LessThanOrEqualTo",
		"ArithmeticOperator": "ex:ArithmeticOperator",
		"Addition": "ex:Addition",
		"Subtraction": "ex:Subtraction",
		"Multiplication": "ex:Multiplication",
		"Division": "ex:Division",
		"Power": "ex:Power",
		"Dymo": "dy:Dymo",
		"DymoType": "dy:DymoType",
		"Conjunction": "dy:Conjunction",
		"Disjunction": "dy:Disjunction",
		"Sequence": "dy:Sequence",
		"Feature": "dy:Feature",
		"Parameter": "dy:Parameter",
		"FeatureType": "dy:FeatureType",
		"ParameterType": "dy:ParameterType",
		"level": "dy:LevelFeature",
		"index": "dy:IndexFeature",
		"onset": "dy:OnsetFeature",
		"pitch": "dy:PitchFeature",
		"duration": "dy:DurationFeature",
		"time": "dy:TimeFeature",
		"segmentLabel": "dy:SegmentLabelFeature",
		"AudioParameter": "dy:AudioParameter",
		"hasStandardValue": "dy:hasStandardValue",
		"isInteger": "dy:isInteger",
		"Play": "dy:Play",
		"Loop": "dy:Loop",
		"Onset": "dy:Onset",
		"Duration": "dy:Duration",
		"DurationRatio": "dy:DurationRatio",
		"Amplitude": "dy:Amplitude",
		"PlaybackRate": "dy:PlaybackRate",
		"TimeStretchRatio": "dy:TimeStretchRatio",
		"Pan": "dy:Pan",
		"Distance": "dy:Distance",
		"Height": "dy:Height",
		"Reverb": "dy:Reverb",
		"Delay": "dy:Delay",
		"Filter": "dy:Filter",
		"StructuralParameter": "dy:StructuralParameter",
		"PartCount": "dy:PartCount",
		"PartDurationRatio": "dy:PartDurationRatio",
		"PartProportion": "dy:PartProportion",
		"source": { "@id": "dy:hasSource", "@type": "xsd:string" },
		"parameters": { "@id": "dy:hasParameter", "@type": "@vocab" },
		"features": { "@id": "dy:hasFeature", "@type": "@vocab" },
		"paramType": { "@id": "dy:hasParameterType", "@type": "@vocab" },
		"featureType": { "@id": "dy:hasFeatureType", "@type": "@vocab" },
		"similars": "dy:hasSimilar",
		"successors": "dy:hasSuccessor",
		"fst": "dy:hasFirst",
		"snd": "dy:hasSecond",
		"Rendering": "mb:Rendering",
		"MobileControl": "mb:MobileControl",
		"SensorControl": "mb:SensorControl",
		"UiControl": "mb:UiControl",
		"DataControl": "mb:DataControl",
		"AutoControl": "mb:AutoControl",
		"AccelerometerX": "mb:AccelerometerX",
		"AccelerometerY": "mb:AccelerometerY",
		"AccelerometerZ": "mb:AccelerometerZ",
		"TiltX": "mb:TiltX",
		"TiltY": "mb:TiltY",
		"TiltZ": "mb:TiltZ",
		"GeolocationLatitude": "mb:GeolocationLatitude",
		"GeolocationLongitude": "mb:GeolocationLongitude",
		"GeolocationDistance": "mb:GeolocationDistance",
		"CompassHeading": "mb:CompassHeading",
		"Beacon": "mb:Beacon",
		"Slider": "mb:Slider",
		"Toggle": "mb:Toggle",
		"Button": "mb:Button",
		"CustomControl": "mb:CustomControl",
		"Random": "mb:Random",
		"Brownian": "mb:Brownian",
		"Ramp": "mb:Ramp",
		"MobileParameter": "mb:MobileParameter",
		"GlobalParameter": "mb:GlobalParameter",
		"ControlParameter": "mb:ControlParameter",
		"ListenerOrientation": "mb:ListenerOrientation",
		"AutoControlFrequency": "mb:AutoControlFrequency",
		"AutoControlTrigger": "mb:AutoControlTrigger",
		"BrownianMaxStepSize": "mb:BrownianMaxStepSize",
		"LeapingProbability": "mb:LeapingProbability",
		"ContinueAfterLeaping": "mb:ContinueAfterLeaping",
		"Navigator": "mb:Navigator",
		"OneShotNavigator": "mb:OneShotNavigator",
		"SequentialNavigator": "mb:SequentialNavigator",
		"SimilarityNavigator": "mb:SimilarityNavigator",
		"GraphNavigator": "mb:GraphNavigator",
		"dymo": { "@id": "mb:hasDymo", "@type": "@id" },
		"ConstraintOwners": "mb:ConstraintOwners",
		"constraint": "mb:constraint",
		"controlParam": "mb:hasControlParam",
		"url": { "@id": "mb:hasUrl", "@type": "xsd:string" },
		"map": { "@id": "mb:hasJsonMap", "@type": "xsd:string" },
		"smooth": { "@id": "mb:isSmooth", "@type": "xsd:boolean" },
		"average": { "@id": "mb:isAverageOf", "@type": "xsd:integer" },
		"uuid": { "@id": "mb:hasUuid", "@type": "xsd:string" },
		"major": { "@id": "mb:hasMajor", "@type": "xsd:integer" },
		"minor": { "@id": "mb:hasMinor", "@type": "xsd:integer" },
		"rampDuration": { "@id": "mb:hasDuration", "@type": "xsd:integer" },
		"navigators": "mb:hasNavigator",
		"dymos": "mb:navDymos"
	}
}

export const DYMO_SIMPLE_CONTEXT = {
	"@context": {
		"@base": "http://tiny.cc/dymo-context/",
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"owl": "http://www.w3.org/2002/07/owl#",
		"sch": "http://schema.org/",
		"mo": "http://purl.org/ontology/mo/",
		"mt": "http://purl.org/ontology/studio/multitrack#",
		"ch": "http://tiny.cc/charm-ontology#",
		"dy": "http://tiny.cc/dymo-ontology#",
		"mb": "http://tiny.cc/mobile-audio-ontology#",
		"ex": "http://tiny.cc/expression-ontology#",
		"value": "rdf:value",
		"name": "sch:name",
		"cdt": "ch:cdt",
		"adt": "ch:adt",
		"parts": "ch:hasPart",
		"Expression": "ex:Expression",
		"directed": "ex:directed",
		"Variable": "ex:Variable",
		"varName": "ex:varName",
		"varType": "ex:varType",
		"varExpr": "ex:varExpr",
		"varValue": "ex:varValue",
		"Constant": "ex:Constant",
		"Quantifier": "ex:Quantifier",
		"ForAll": "ex:ForAll",
		"ThereExists": "ex:ThereExists",
		"vars": "ex:vars",
		"body": "ex:body",
		"Accessor": "ex:Accessor",
		"object": "ex:object",
		"property": "ex:property",
		"FunctionalTerm": "ex:FunctionalTerm",
		"NamedFunction": "ex:NamedFunction",
		"PropertyFunction": "ex:PropertyFunction",
		"prop": "ex:prop",
		"Function": "ex:Function",
		"func": "ex:func",
		"args": "ex:args",
		"Conditional": "ex:Conditional",
		"antecedent": "ex:antecedent",
		"consequent": "ex:consequent",
		"alternative": "ex:alternative",
		"BinaryOperator": "ex:BinaryOperator",
		"left": "ex:left",
		"right": "ex:right",
		"RelationalOperator": "ex:RelationalOperator",
		"EqualTo": "ex:EqualTo",
		"NotEqualTo": "ex:NotEqualTo",
		"GreaterThan": "ex:GreaterThan",
		"LessThan": "ex:LessThan",
		"GreaterThanOrEqualTo": "ex:GreaterThanOrEqualTo",
		"LessThanOrEqualTo": "ex:LessThanOrEqualTo",
		"ArithmeticOperator": "ex:ArithmeticOperator",
		"Addition": "ex:Addition",
		"Subtraction": "ex:Subtraction",
		"Multiplication": "ex:Multiplication",
		"Division": "ex:Division",
		"Power": "ex:Power",
		"Dymo": "dy:Dymo",
		"DymoType": "dy:DymoType",
		"Conjunction": "dy:Conjunction",
		"Disjunction": "dy:Disjunction",
		"Sequence": "dy:Sequence",
		"Feature": "dy:Feature",
		"Parameter": "dy:Parameter",
		"FeatureType": "dy:FeatureType",
		"ParameterType": "dy:ParameterType",
		"level": "dy:LevelFeature",
		"index": "dy:IndexFeature",
		"onset": "dy:OnsetFeature",
		"pitch": "dy:PitchFeature",
		"duration": "dy:DurationFeature",
		"time": "dy:TimeFeature",
		"segmentLabel": "dy:SegmentLabelFeature",
		"AudioParameter": "dy:AudioParameter",
		"hasStandardValue": "dy:hasStandardValue",
		"isInteger": "dy:isInteger",
		"Play": "dy:Play",
		"Loop": "dy:Loop",
		"Onset": "dy:Onset",
		"Duration": "dy:Duration",
		"DurationRatio": "dy:DurationRatio",
		"Amplitude": "dy:Amplitude",
		"PlaybackRate": "dy:PlaybackRate",
		"TimeStretchRatio": "dy:TimeStretchRatio",
		"Pan": "dy:Pan",
		"Distance": "dy:Distance",
		"Height": "dy:Height",
		"Reverb": "dy:Reverb",
		"Delay": "dy:Delay",
		"Filter": "dy:Filter",
		"StructuralParameter": "dy:StructuralParameter",
		"PartCount": "dy:PartCount",
		"PartDurationRatio": "dy:PartDurationRatio",
		"PartProportion": "dy:PartProportion",
		"source": "dy:hasSource",
		"parameters": "dy:hasParameter",
		"features": "dy:hasFeature",
		"paramType": "dy:hasParameterType",
		"featureType": "dy:hasFeatureType",
		"similars": "dy:hasSimilar",
		"successors": "dy:hasSuccessor",
		"fst": "dy:hasFirst",
		"snd": "dy:hasSecond",
		"Rendering": "mb:Rendering",
		"MobileControl": "mb:MobileControl",
		"SensorControl": "mb:SensorControl",
		"UiControl": "mb:UiControl",
		"DataControl": "mb:DataControl",
		"AutoControl": "mb:AutoControl",
		"AccelerometerX": "mb:AccelerometerX",
		"AccelerometerY": "mb:AccelerometerY",
		"AccelerometerZ": "mb:AccelerometerZ",
		"TiltX": "mb:TiltX",
		"TiltY": "mb:TiltY",
		"TiltZ": "mb:TiltZ",
		"GeolocationLatitude": "mb:GeolocationLatitude",
		"GeolocationLongitude": "mb:GeolocationLongitude",
		"GeolocationDistance": "mb:GeolocationDistance",
		"CompassHeading": "mb:CompassHeading",
		"Beacon": "mb:Beacon",
		"Slider": "mb:Slider",
		"Toggle": "mb:Toggle",
		"Button": "mb:Button",
		"CustomControl": "mb:CustomControl",
		"Random": "mb:Random",
		"Brownian": "mb:Brownian",
		"Ramp": "mb:Ramp",
		"MobileParameter": "mb:MobileParameter",
		"GlobalParameter": "mb:GlobalParameter",
		"ControlParameter": "mb:ControlParameter",
		"ListenerOrientation": "mb:ListenerOrientation",
		"AutoControlFrequency": "mb:AutoControlFrequency",
		"AutoControlTrigger": "mb:AutoControlTrigger",
		"BrownianMaxStepSize": "mb:BrownianMaxStepSize",
		"LeapingProbability": "mb:LeapingProbability",
		"ContinueAfterLeaping": "mb:ContinueAfterLeaping",
		"Navigator": "mb:Navigator",
		"OneShotNavigator": "mb:OneShotNavigator",
		"SequentialNavigator": "mb:SequentialNavigator",
		"SimilarityNavigator": "mb:SimilarityNavigator",
		"GraphNavigator": "mb:GraphNavigator",
		"dymo": "mb:hasDymo",
		"ConstraintOwners": "mb:ConstraintOwners",
		"constraint": "mb:constraint",
		"controlParam": "mb:hasControlParam",
		"url": "mb:hasUrl",
		"map": "mb:hasJsonMap",
		"smooth": "mb:isSmooth",
		"average": "mb:isAverageOf",
		"uuid": "mb:hasUuid",
		"major": "mb:hasMajor",
		"minor": "mb:hasMinor",
		"rampDuration": "mb:hasDuration",
		"navigators": "mb:hasNavigator",
		"dymos": "mb:navDymos"
	}
}