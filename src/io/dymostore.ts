import { Util } from 'n3'
import { fromRDF, frame, compact } from 'jsonld'
import { EasyStore } from './easystore'
import * as uris from '../globals/uris'
import { DYMO_CONTEXT, DYMO_SIMPLE_CONTEXT } from '../globals/contexts'
import { intersectArrays } from '../util/arrays'

/**
 * A graph store for dymos based on EasyStore.
 */
export class DymoStore extends EasyStore {

	private dymoOntologyPath = "http://tiny.cc/dymo-ontology"//"../ontologies/dymo-ontology.n3";//"http://tiny.cc/dymo-ontology";
	private mobileOntologyPath = "http://tiny.cc/mobile-audio-ontology"//"../ontologies/mobile-audio-ontology.n3";//"http://tiny.cc/mobile-audio-ontology";
	private dymoContextPath = "http://tiny.cc/dymo-context";
	private dymoSimpleContextPath = "http://tiny.cc/dymo-context-simple";
	private dymoBasePaths = {};

	//creates the store and loads some basic ontology files
	constructor(callback?: Function) {
		super();
		this.loadFileIntoStore(this.dymoOntologyPath, false, () => {
			this.loadFileIntoStore(this.mobileOntologyPath, false, () => {
				if (callback) {
					callback();
				}
			});
		});
	}

	addBasePath(dymoUri, path) {
		this.dymoBasePaths[dymoUri] = path;
	}

	getBasePath(dymoUri) {
		return this.recursiveFindInParents([dymoUri], uri => this.dymoBasePaths[uri]);
	}

	//depth first search through parents. as soon as the given searchFunction returns something, return it
	private recursiveFindInParents(dymoUris, searchFunction) {
		for (var i = 0; i < dymoUris.length; i++) {
			var currentResult = searchFunction(dymoUris[i]);
			if (currentResult) {
				return currentResult;
			}
		}
		for (var i = 0; i < dymoUris.length; i++) {
			var currentResult = this.recursiveFindInParents(this.findParents(dymoUris[i]), searchFunction);
			if (currentResult) {
				return currentResult;
			}
		}
	}

	getSourcePath(dymoUri) {
		var sourcePath = this.findObjectValue(dymoUri, uris.HAS_SOURCE);
		if (sourcePath) {
			var basePath = this.getBasePath(dymoUri);
			return basePath? basePath+sourcePath: sourcePath;
		}
		var parentUris = this.findParents(dymoUri);
		if (parentUris.length > 0) {
			for (var i = 0; i < parentUris.length; i++) {
				var parentSourcePath = this.getSourcePath(parentUris[i]);
				if (parentSourcePath) {
					return parentSourcePath;
				}
			}
		}
	}

	addSpecificParameterObserver(parameterUri, observer) {
		this.addValueObserver(parameterUri, uris.VALUE, observer);
	}

	addParameterObserver(dymoUri, parameterType, observer) {
		if (dymoUri && parameterType) {
			//add parameter if there is none so far and get uri
			var parameterUri = this.setParameter(dymoUri, parameterType);
			//add observer
			this.addValueObserver(parameterUri, uris.VALUE, observer);
			return parameterUri;
		}
	}

	getParameterObservers(dymoUri, parameterType) {
		if (dymoUri && parameterType) {
			var parameterUri = this.findObjectOfType(dymoUri, uris.HAS_PARAMETER, parameterType);
			if (parameterUri) {
				return this.getValueObservers(parameterUri, uris.VALUE);
			}
		}
	}

	removeParameterObserver(dymoUri, parameterType, observer) {
		if (dymoUri && parameterType) {
			var parameterUri = this.findObjectOfType(dymoUri, uris.HAS_PARAMETER, parameterType);
			if (parameterUri) {
				this.removeValueObserver(parameterUri, uris.VALUE, observer);
			}
		}
	}

	///////// ADDING FUNCTIONS //////////

	addDymo(dymoUri, parentUri, partUri, sourcePath, type) {
		this.addTriple(dymoUri, uris.TYPE, uris.DYMO);
		if (parentUri) {
			this.addPart(parentUri, dymoUri);
		}
		if (partUri) {
			this.addPart(dymoUri, partUri);
		}
		if (sourcePath) {
			this.addTriple(dymoUri, uris.HAS_SOURCE, Util.createLiteral(sourcePath));
		}
		if (type) {
			this.addTriple(dymoUri, uris.CDT, type);
		}
		return dymoUri;
	}

	addPart(dymoUri, partUri) {
		this.addObjectToList(dymoUri, uris.HAS_PART, partUri);
	}

	setParts(dymoUri, partUris) {
		this.deleteList(dymoUri, uris.HAS_PART);
		this.addObjectsToList(dymoUri, uris.HAS_PART, partUris);
	}

	replacePartAt(dymoUri, partUri, index) {
		if (dymoUri != partUri) {//avoid circular dymos
			return this.replaceObjectInList(dymoUri, uris.HAS_PART, partUri, index);
		}
	}

	addSimilar(dymoUri, similarUri) {
		this.addTriple(dymoUri, uris.HAS_SIMILAR, similarUri);
	}

	addSuccessor(dymoUri, successorUri) {
		this.addTriple(dymoUri, uris.HAS_SUCCESSOR, successorUri);
	}

	setFeature(dymoUri, featureType, value) {
		return this.setObjectValue(dymoUri, uris.HAS_FEATURE, featureType, uris.VALUE, value);
	}

	addParameter(ownerUri, parameterType, value?: string|number, observer?: Object) {
		this.setParameter(ownerUri, parameterType, value);
		if (observer) {
			this.addParameterObserver(ownerUri, parameterType, observer);
		}
	}

	addCustomParameter(ownerUri, paramUri) {
		this.addTriple(ownerUri, uris.HAS_PARAMETER, paramUri);
		this.addTriple(paramUri, uris.TYPE, uris.CUSTOM_PARAMETER);
		return paramUri;
	}

	setParameter(ownerUri, parameterType, value?) {
		//initialize in case the parameter doesn't exist yet
		if (!this.findParameterUri(ownerUri, parameterType) && (value == null || isNaN(value))) {
			value = this.findObjectValue(parameterType, uris.HAS_STANDARD_VALUE);
		}
		//round if integer parameter
		if (this.findObject(parameterType, uris.IS_INTEGER)) {
			value = Math.round(value);
		}
		//set the new value
		return this.setObjectValue(ownerUri, uris.HAS_PARAMETER, parameterType, uris.VALUE, value);
	}

	addControl(name, type, uri?: string) {
		if (!uri) {
			uri = this.createBlankNode();
		}
		if (name) {
			this.addTriple(uri, uris.NAME, Util.createLiteral(name));
		}
		this.addTriple(uri, uris.TYPE, type);
		return uri;
	}

	addDataControl(url, map) {
		var uri = this.addControl(null, uris.DATA_CONTROL);
		this.addTriple(uri, uris.HAS_URL, Util.createLiteral(url));
		this.addTriple(uri, uris.HAS_JSON_MAP, Util.createLiteral(map));
		return uri;
	}

	addRendering(renderingUri, dymoUri) {
		this.addTriple(renderingUri, uris.TYPE, uris.RENDERING);
		this.addTriple(renderingUri, uris.HAS_DYMO, dymoUri);
	}

	addMapping(ownerUri, mappingFunction, targetList, targetFunction, rangeUri) {
		var mappingUri = this.createBlankNode();
		this.addTriple(mappingUri, uris.TYPE, uris.MAPPING);
		if (ownerUri) {
			this.addTriple(ownerUri, uris.HAS_MAPPING, mappingUri);
		}
		this.addTriple(mappingUri, uris.HAS_FUNCTION, mappingFunction);
		if (targetList) {
			for (var i = 0; i < targetList.length; i++) {
				this.addTriple(mappingUri, uris.TO_TARGET, targetList[i]);
			}
		} else if (targetFunction) {
			this.addTriple(mappingUri, uris.TO_TARGET, targetFunction);
		}
		this.addTriple(mappingUri, uris.HAS_RANGE, rangeUri);
		if (!this.findObject(rangeUri, uris.TYPE)) {
			this.addTriple(rangeUri, uris.TYPE, uris.CUSTOM_PARAMETER);
		}
		return mappingUri;
	}

	addNavigator(renderingUri, navigatorType, subsetFunctionArgs, subsetFunctionBody) {
		var navUri = this.createBlankNode();
		this.addTriple(renderingUri, uris.HAS_NAVIGATOR, navUri);
		this.addTriple(navUri, uris.TYPE, navigatorType);
		var funcUri = this.addFunction(subsetFunctionArgs, subsetFunctionBody);
		this.addTriple(navUri, uris.NAV_DYMOS, funcUri);
		return navUri;
	}

	addFunction(args, body) {
		var funcUri = this.createBlankNode();
		var vars = Object.keys(args);
		for (var i = 0; i < vars.length; i++) {
			var argUri = this.createBlankNode();
			this.addTriple(funcUri, uris.HAS_ARGUMENT, argUri);
			this.addTriple(argUri, uris.HAS_VARIABLE, Util.createLiteral(vars[i]));
			this.addTriple(argUri, uris.HAS_VALUE, args[vars[i]]);
		}
		this.addTriple(funcUri, uris.HAS_BODY, Util.createLiteral(body));
		return funcUri;
	}

	updatePartOrder(dymoUri, attributeName) {
		var parts = this.findParts(dymoUri);
		if (parts.length > 0) {
			parts.sort((p,q) => this.findAttributeValue(p, attributeName) - this.findAttributeValue(q, attributeName));
			this.setParts(dymoUri, parts);
		}
	}


	///////// QUERY FUNCTIONS //////////

	//returns an array with all uris of dymos that do not have parents
	findTopDymos() {
		var allDymos = this.findAllSubjects(uris.TYPE, uris.DYMO);
		var allParents = this.findAllSubjects(uris.HAS_PART);
		var allParts = [].concat.apply([], allParents.map(p => this.findParts(p)));
		return allDymos.filter(p => allParts.indexOf(p) < 0);
	}

	//returns an array with the uris of all parts of the object with the given uri
	findParts(dymoUri) {
		return this.findAllObjects(dymoUri, uris.HAS_PART);
	}

	findPartAt(dymoUri, index) {
		return this.findObjectInListAt(dymoUri, uris.HAS_PART, index);
	}

	//returns an array with the uris of all similars of the object with the given uri
	findSimilars(dymoUri) {
		//TODO DOESNT WORK WITH LISTS!!!!!
		return this.findAllObjects(dymoUri, uris.HAS_SIMILAR);
	}

	//returns an array with the uris of all successors of the object with the given uri
	findSuccessors(dymoUri) {
		//TODO DOESNT WORK WITH LISTS!!!!!
		return this.findAllObjects(dymoUri, uris.HAS_SUCCESSOR);
	}

	//TODO currently only works for single hierarchy (implement and test)
	findAllParents(dymoUri) {
		var parents = [];
		while (dymoUri != null) {
			parents.push(dymoUri);
			dymoUri = this.findParents(dymoUri)[0];
		}
		return parents;
	}

	findParents(dymoUri) {
		var containingLists = this.findContainingLists(dymoUri);
		return containingLists[0].filter((e,i) => containingLists[1][i] == uris.HAS_PART);
	}

	//returns an array with the uris of all parts, parts of parts, etc of the object with the given uri
	findAllObjectsInHierarchy(dymoUri) {
		if (dymoUri) {
			var allObjects = [dymoUri];
			var parts = this.findParts(dymoUri);
			//if (parts.length > 0) console.log(dymoUri, parts.map(p => p ? parseInt(p.match(/\d+/)[0]) : null));
			for (var i = 0; i < parts.length; i++) {
				allObjects = allObjects.concat(this.findAllObjectsInHierarchy(parts[i]));
			}
			return allObjects;
		}
	}

	findDymoRelations() {
		var domainUris = this.findAllSubjects(uris.DOMAIN, uris.DYMO);
		var rangeUris = this.findAllSubjects(uris.RANGE, uris.DYMO);
		//TODO FIND uris.HAS_PART AUTOMATICALLY..
		return [uris.HAS_PART].concat(intersectArrays(domainUris, rangeUris));
	}

	findMappings(renderingUri) {
		return this.findAllObjects(renderingUri, uris.HAS_MAPPING);
	}

	findNavigators(renderingUri) {
		return this.findAllObjects(renderingUri, uris.HAS_NAVIGATOR);
	}

	findFunction(uri) {
		if (uri) {
			var args = this.findAllObjects(uri, uris.HAS_ARGUMENT);
			var argVars = args.map(a => this.findObjectValue(a, uris.HAS_VARIABLE));
			var argVals = args.map(a => this.findObject(a, uris.HAS_VALUE));
			var body = this.findObjectValue(uri, uris.HAS_BODY);
			return [argVars, argVals, body];
		}
	}

	findAttributeValue(dymoUri, attributeType) {
		var value = this.findParameterValue(dymoUri, attributeType);
		if (value == null) {
			value = this.findFeatureValue(dymoUri, attributeType);
		}
		return value;
	}

	findFeatureValue(dymoUri, featureType) {
		if (featureType === uris.LEVEL_FEATURE) {
			return this.findLevel(dymoUri);
		} else if (featureType === uris.INDEX_FEATURE) {
			return this.findPartIndex(dymoUri);
		} else {
			return this.findObjectValueOfType(dymoUri, uris.HAS_FEATURE, featureType, uris.VALUE);
		}
	}

	findAllFeatureValues(dymoUri) {
		return this.findAllObjectValuesOfType(dymoUri, uris.HAS_FEATURE, uris.VALUE)
	}

	findAllNumericFeatureValues(dymoUri) {
		return this.findAllFeatureValues(dymoUri).filter(v => !isNaN(v));
	}

	findParameterValue(dymoUri, parameterType) {
		return this.findObjectValueOfType(dymoUri, uris.HAS_PARAMETER, parameterType, uris.VALUE);
	}

	findParameterUri(ownerUri, parameterType) {
		if (ownerUri) {
			return this.findObjectOfType(ownerUri, uris.HAS_PARAMETER, parameterType);
		}
		return this.findSubject(null, parameterType);
	}

	//TODO FOR NOW ONLY WORKS WITH SINGLE HIERARCHY..
	findPartIndex(dymoUri) {
		var firstParentUri = this.findParents(dymoUri)[0];
		return this.findObjectIndexInList(firstParentUri, uris.HAS_PART, dymoUri);
	}

	//TODO FOR NOW ONLY WORKS WITH SINGLE HIERARCHY..
	findLevel(dymoUri) {
		var level = 0;
		var parent = this.findParents(dymoUri)[0];
		while (parent) {
			level++;
			parent = this.findParents(parent)[0];
		}
		return level;
	}

	//TODO optimize
	findMaxLevel() {
		var allDymos = this.findAllSubjects(uris.TYPE, uris.DYMO);
		var maxLevel = 0;
		for (var i = 0; i < allDymos.length; i++) {
			maxLevel = Math.max(maxLevel, this.findLevel(allDymos[i]));
		}
		return maxLevel;
	}


	///////// WRITING FUNCTIONS //////////

	toJsonld(callback) {
		var firstTopDymo = this.findTopDymos()[0];
		this.toRdf(result => this.rdfToJsonld(result, firstTopDymo, callback));
	}

	private triplesToJsonld(triples, frameId, callback) {
		this.triplesToRdf(triples, result => this.rdfToJsonld(result, frameId, callback));
	}

	private rdfToJsonld(rdf, frameId, callback) {
		rdf = rdf.split('_b').join('b'); //rename blank nodes (jsonld.js can't handle the n3.js nomenclature)
		fromRDF(rdf, {format: 'application/nquads'}, (err, doc) => {
			frame(doc, {"@id":frameId}, (err, framed) => {
				compact(framed, DYMO_CONTEXT, (err, compacted) => {
					//deal with imperfections of jsonld.js compaction algorithm to make it reeaally nice
					compact(compacted, DYMO_SIMPLE_CONTEXT, (err, compacted) => {
						//make it even nicer by removing blank nodes
						this.removeBlankNodeIds(compacted);
						//put the right context back
						compacted["@context"] = this.dymoContextPath;
						//compact local uris
						var result = JSON.stringify(compacted);
						result = result.replace(new RegExp(this.dymoContextPath+'/', 'g'), "");
						callback(result);
					});
				});
			});
		});
	}

	//returns a jsonld representation of an object removed from any hierarchy of objects of the same type
	private toFlatJsonld(uri, callback) {
		var type = this.findObject(uri, uris.TYPE);
		var triples = this.recursiveFindAllTriples(uri, type);
		this.triplesToJsonld(triples, uri, result => {
			var json = JSON.parse(result);
			//TODO a hack to insert level feature, maybe put in a better place
			if (type == uris.DYMO) {
				var level = this.findLevel(uri).toString();
				if (!json["features"]) {
					json["features"] = [];
				}
				json["features"].push({
					"@type": "level",
					"value": {
						"@type": "xsd:integer",
						"@value": level
					}
				});
			}
			callback(json);
		});
	}

	toJsonGraph(nodeClass, edgeProperty, callback) {
		var graph = {"nodes":[], "edges":[]};
		var nodeMap = {};
		var nodeUris = this.findAllSubjects(uris.TYPE, nodeClass);
		var edgeTriples = this.find(null, edgeProperty, null);

		//TODO REWRITE THIS WITH PROMISES!!!!!!!
		Promise.all(nodeUris.map(uri => new Promise(resolve => this.toFlatJsonld(uri, resolve))))
		.then(result => {
			graph["nodes"] = result;
			for (var i = 0; i < nodeUris.length; i++) {
				nodeMap[nodeUris[i]] = graph["nodes"][i];
			}
			graph["edges"] = [];
			for (var i = 0; i < edgeTriples.length; i++) {
				if (this.find(edgeTriples[i].object, uris.TYPE, nodeClass).length == 0) {
					if (this.find(edgeTriples[i].object, uris.FIRST, null).length > 0) {
						//it's a list!!
						var objects = this.findObjectOrList(edgeTriples[i].subject, edgeProperty);
						objects = objects.map(t => this.createLink(nodeMap[edgeTriples[i].subject], nodeMap[t]));
						graph["edges"] = graph["edges"].concat(objects);
					}
				} else {
					graph["edges"].push(this.createLink(nodeMap[edgeTriples[i].subject], nodeMap[edgeTriples[i].object]));
				}
			}
			callback(graph);
		});
	}

	/*this.toJsonMappingGraph(callback) {
		var graph = {"nodes":[], "edges":[]};
		var nodeMap = {};
		var nodeUris = [];
		var edges = [];
		var mappingUris = store.findAllObjects(renderingUri, uris.HAS_MAPPING);
		for (var i = 0; i < mappingUris.length; i++) {
			var domainDimUris = store.findAllObjects(mappingUris[i], HAS_DOMAIN_DIMENSION);
			for (var j = 0; j < domainDimUris.length; j++) {
				edges.push(domainDimUris, mappingUris[i])
			}
			var rangeUri = store.findObject(mappingUri, HAS_RANGE);
		}



		for (var i = 0; i < this.findAllSubjects(uris.TYPE, nodeClass);
		var edgeTriples = this.find(null, edgeProperty, null);
		async.map(nodeUris, toFlatJsonld, function(err, result){
			graph["nodes"] = result;
			for (var i = 0; i < nodeUris.length; i++) {
				nodeMap[nodeUris[i]] = graph["nodes"][i];
			}
			graph["edges"] = [];
			for (var i = 0; i < edgeTriples.length; i++) {
				if (this.find(edgeTriples[i].object, uris.TYPE, nodeClass).length == 0) {
					if (this.find(edgeTriples[i].object, FIRST).length > 0) {
						//it's a list!!
						var objects = this.findObjectOrList(edgeTriples[i].subject, edgeProperty);
						objects = objects.map(function(t){return createLink(nodeMap[edgeTriples[i].subject], nodeMap[t]);});
						graph["edges"] = graph["edges"].concat(objects);
					}
				} else {
					graph["edges"].push(createLink(nodeMap[edgeTriples[i].subject], nodeMap[edgeTriples[i].object]));
				}
			}
			callback(graph);
		});
	}*/

	private createLink(source, target) {
		return {"source":source, "target":target, "value":1};
	}

	private removeBlankNodeIds(obj) {
		if (obj && obj instanceof Object) {
			for (var key in obj) {
				if (key == "@id" && obj[key].includes("_:b")) {
					delete obj[key];
				} else {
					this.removeBlankNodeIds(obj[key]);
				}
			}
		}
	}

}
