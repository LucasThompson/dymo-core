import { Util } from 'n3';
import async from 'async-es';

import { EasyStore } from './easystore';
import { intersectArrays } from '../util/arrays';
import { HAS_SOURCE, HAS_PART, HAS_SIMILAR, HAS_SUCCESSOR, HAS_FEATURE, HAS_PARAMETER, HAS_FUNCTION,
	VALUE, TYPE, DYMO, CDT, RENDERING, HAS_DYMO, NAME, TO_TARGET, HAS_STANDARD_VALUE, IS_INTEGER,
	HAS_MAPPING, HAS_RANGE, HAS_NAVIGATOR, NAV_DYMOS, HAS_ARGUMENT, HAS_VARIABLE, HAS_VALUE, HAS_BODY,
	DOMAIN, RANGE, LEVEL_FEATURE, INDEX_FEATURE, FIRST } from '../globals/uris';
import { DYMO_CONTEXT, DYMO_SIMPLE_CONTEXT } from '../globals/contexts';

/**
 * A graph store for dymos based on EasyStore.
 * @constructor
 * @extends {EasyStore}
 */
export class DymoStore extends EasyStore {

	private dymoBasePaths = {};

	//creates the store and loads some basic ontology files
	constructor(callback) {
		super();
		var dymoOntologyPath = "http://tiny.cc/dymo-ontology"//"../ontologies/dymo-ontology.n3";//"http://tiny.cc/dymo-ontology";
		var mobileOntologyPath = "http://tiny.cc/mobile-audio-ontology"//"../ontologies/mobile-audio-ontology.n3";//"http://tiny.cc/mobile-audio-ontology";
		var dymoContextPath = "http://tiny.cc/dymo-context";
		var dymoSimpleContextPath = "http://tiny.cc/dymo-context-simple";
		this.loadFileIntoStore(dymoOntologyPath, false, function() {
			this.loadFileIntoStore(mobileOntologyPath, false, function() {
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
		return this.recursiveFindInParents([dymoUri], function(uri) {
			return this.dymoBasePaths[uri];
		});
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
		var sourcePath = this.findObjectValue(dymoUri, HAS_SOURCE);
		if (sourcePath) {
			return this.getBasePath(dymoUri)+sourcePath;
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
		this.addValueObserver(parameterUri, VALUE, observer);
	}

	addParameterObserver(dymoUri, parameterType, observer) {
		if (dymoUri && parameterType) {
			//add parameter if there is none so far and get uri
			var parameterUri = this.setParameter(dymoUri, parameterType);
			//add observer
			this.addValueObserver(parameterUri, VALUE, observer);
			return parameterUri;
		}
	}

	getParameterObservers(dymoUri, parameterType) {
		if (dymoUri && parameterType) {
			var parameterUri = this.findObjectOfType(dymoUri, HAS_PARAMETER, parameterType);
			if (parameterUri) {
				return this.getValueObservers(parameterUri, VALUE);
			}
		}
	}

	removeParameterObserver(dymoUri, parameterType, observer) {
		if (dymoUri && parameterType) {
			var parameterUri = this.findObjectOfType(dymoUri, HAS_PARAMETER, parameterType);
			if (parameterUri) {
				this.removeValueObserver(parameterUri, VALUE, observer);
			}
		}
	}

	///////// ADDING FUNCTIONS //////////

	addDymo(dymoUri, parentUri, partUri, sourcePath, type) {
		this.addTriple(dymoUri, TYPE, DYMO);
		if (parentUri) {
			this.addPart(parentUri, dymoUri);
		}
		if (partUri) {
			this.addPart(dymoUri, partUri);
		}
		if (sourcePath) {
			this.addTriple(dymoUri, HAS_SOURCE, Util.createLiteral(sourcePath));
		}
		if (type) {
			this.addTriple(dymoUri, CDT, type);
		}
	}

	private addPart(dymoUri, partUri) {
		this.addObjectToList(dymoUri, HAS_PART, partUri);
	}

	setParts(dymoUri, partUris) {
		this.deleteList(dymoUri, HAS_PART);
		this.addObjectsToList(dymoUri, HAS_PART, partUris);
	}

	replacePartAt(dymoUri, partUri, index) {
		if (dymoUri != partUri) {//avoid circular dymos
			return this.replaceObjectInList(dymoUri, HAS_PART, partUri, index);
		}
	}

	addSimilar(dymoUri, similarUri) {
		this.addTriple(dymoUri, HAS_SIMILAR, similarUri);
	}

	addSuccessor(dymoUri, successorUri) {
		this.addTriple(dymoUri, HAS_SUCCESSOR, successorUri);
	}

	setFeature(dymoUri, featureType, value) {
		return this.setObjectValue(dymoUri, HAS_FEATURE, featureType, VALUE, value);
	}

	/**
	 * @param {string|number=} value (optional)
	 * @param {Object=} observer (optional)
	 */
	addParameter(ownerUri, parameterType, value?, observer?) {
		this.setParameter(ownerUri, parameterType, value);
		if (observer) {
			this.addParameterObserver(ownerUri, parameterType, observer);
		}
	}

	/**
	 * @param {string|number=} value (optional)
	 */
	setParameter(ownerUri, parameterType, value?) {
		//initialize in case the parameter doesn't exist yet
		if (!this.findParameterUri(ownerUri, parameterType) && (value == null || isNaN(value))) {
			value = this.findObjectValue(parameterType, HAS_STANDARD_VALUE);
		}
		//round if integer parameter
		if (this.findObject(parameterType, IS_INTEGER)) {
			value = Math.round(value);
		}
		//set the new value
		return this.setObjectValue(ownerUri, HAS_PARAMETER, parameterType, VALUE, value);
	}

	addControl(name, type, uri) {
		if (!uri) {
			uri = this.createBlankNode();
		}
		this.addTriple(uri, NAME, Util.createLiteral(name));
		this.addTriple(uri, TYPE, type);
		return uri;
	}

	addRendering(renderingUri, dymoUri) {
		this.addTriple(renderingUri, TYPE, RENDERING);
		this.addTriple(renderingUri, HAS_DYMO, dymoUri);
	}

	addMapping(renderingUri, mappingFunction, targetList, targetFunction, rangeUri) {
		var mappingUri = this.createBlankNode();
		this.addTriple(renderingUri, HAS_MAPPING, mappingUri);
		this.addTriple(mappingUri, HAS_FUNCTION, mappingFunction);
		if (targetList) {
			for (var i = 0; i < targetList.length; i++) {
				this.addTriple(mappingUri, TO_TARGET, targetList[i]);
			}
		} else if (targetFunction) {
			this.addTriple(mappingUri, TO_TARGET, targetFunction);
		}
		this.addTriple(mappingUri, HAS_RANGE, rangeUri);
		return mappingUri;
	}

	addNavigator(renderingUri, navigatorType, subsetFunctionArgs, subsetFunctionBody) {
		var navUri = this.createBlankNode();
		this.addTriple(renderingUri, HAS_NAVIGATOR, navUri);
		this.addTriple(navUri, TYPE, navigatorType);
		var funcUri = this.addFunction(subsetFunctionArgs, subsetFunctionBody);
		this.addTriple(navUri, NAV_DYMOS, funcUri);
		return navUri;
	}

	addFunction(args, body) {
		var funcUri = this.createBlankNode();
		var vars = Object.keys(args);
		for (var i = 0; i < vars.length; i++) {
			var argUri = this.createBlankNode();
			this.addTriple(funcUri, HAS_ARGUMENT, argUri);
			this.addTriple(argUri, HAS_VARIABLE, Util.createLiteral(vars[i]));
			this.addTriple(argUri, HAS_VALUE, args[vars[i]]);
		}
		this.addTriple(funcUri, HAS_BODY, Util.createLiteral(body));
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
		var allDymos = this.findAllSubjects(TYPE, DYMO);
		var allParents = this.findAllSubjects(HAS_PART, null);
		var allParts = [].concat.apply([], allParents.map(p => this.findParts(p)));
		return allDymos.filter(function(p) { return allParts.indexOf(p) < 0 });
	}

	//returns an array with the uris of all parts of the object with the given uri
	findParts(dymoUri) {
		//TODO DOESNT WORK WITH LISTS!!!!!
		return this.findAllObjects(dymoUri, HAS_PART);
	}

	findPartAt(dymoUri, index) {
		return this.findObjectInListAt(dymoUri, HAS_PART, index);
	}

	//returns an array with the uris of all similars of the object with the given uri
	findSimilars(dymoUri) {
		//TODO DOESNT WORK WITH LISTS!!!!!
		return this.findAllObjects(dymoUri, HAS_SIMILAR);
	}

	//returns an array with the uris of all successors of the object with the given uri
	findSuccessors(dymoUri) {
		//TODO DOESNT WORK WITH LISTS!!!!!
		return this.findAllObjects(dymoUri, HAS_SUCCESSOR);
	}

	findParents(dymoUri) {
		var containingLists = this.findContainingLists(dymoUri);
		return containingLists[0].filter(function(e,i){return containingLists[1][i] == HAS_PART;});
	}

	//returns an array with the uris of all parts, parts of parts, etc of the object with the given uri
	findAllObjectsInHierarchy(dymoUri) {
		var allObjects = [dymoUri];
		var parts = this.findParts(dymoUri);
		for (var i = 0; i < parts.length; i++) {
			allObjects = allObjects.concat(this.findAllObjectsInHierarchy(parts[i]));
		}
		return allObjects;
	}

	findDymoRelations() {
		var domainUris = this.findAllSubjects(DOMAIN, DYMO);
		var rangeUris = this.findAllSubjects(RANGE, DYMO);
		//TODO FIND HAS_PART AUTOMATICALLY..
		return [HAS_PART].concat(intersectArrays(domainUris, rangeUris));
	}

	findMappings(renderingUri) {
		return this.findAllObjects(renderingUri, HAS_MAPPING);
	}

	findNavigators(renderingUri) {
		return this.findAllObjects(renderingUri, HAS_NAVIGATOR);
	}

	findFunction(uri) {
		if (uri) {
			var args = this.findAllObjects(uri, HAS_ARGUMENT);
			var argVars = args.map(a => this.findObjectValue(a, HAS_VARIABLE));
			var argVals = args.map(a => this.findObject(a, HAS_VALUE));
			var body = this.findObjectValue(uri, HAS_BODY);
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
		if (featureType === LEVEL_FEATURE) {
			return this.findLevel(dymoUri);
		} else if (featureType === INDEX_FEATURE) {
			return this.findPartIndex(dymoUri);
		} else {
			return this.findObjectValueOfType(dymoUri, HAS_FEATURE, featureType, VALUE);
		}
	}

	findAllFeatureValues(dymoUri) {
		return this.findAllObjectValuesOfType(dymoUri, HAS_FEATURE, VALUE)
	}

	findAllNumericFeatureValues(dymoUri) {
		return this.findAllFeatureValues(dymoUri).filter(function(v){return !isNaN(v);});
	}

	findParameterValue(dymoUri, parameterType) {
		return this.findObjectValueOfType(dymoUri, HAS_PARAMETER, parameterType, VALUE);
	}

	findParameterUri(ownerUri, parameterType) {
		if (ownerUri) {
			return this.findObjectOfType(ownerUri, HAS_PARAMETER, parameterType);
		}
		return this.findSubject(null, parameterType);
	}

	//TODO FOR NOW ONLY WORKS WITH SINGLE HIERARCHY..
	findPartIndex(dymoUri) {
		var firstParentUri = this.findParents(dymoUri)[0];
		return this.findObjectIndexInList(firstParentUri, HAS_PART, dymoUri);
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
		var allDymos = this.findAllSubjects(TYPE, DYMO);
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
		this.jsonld.fromRDF(rdf, {format: 'application/nquads'}, function(err, doc) {
			this.jsonld.frame(doc, {"@id":frameId}, function(err, framed) {
				this.jsonld.compact(framed, DYMO_CONTEXT, function(err, compacted) {
					//deal with imperfections of jsonld.js compaction algorithm to make it reeaally nice
					this.jsonld.compact(compacted, DYMO_SIMPLE_CONTEXT, function(err, compacted) {
						//make it even nicer by removing blank nodes
						this.removeBlankNodeIds(compacted);
						compacted = JSON.stringify(compacted, null, 2);
						//compact local uris
						compacted = compacted.replace(new RegExp(this.dymoContextPath+'/', 'g'), "");
						//put the right context back
						compacted = compacted.replace(this.dymoSimpleContextPath, this.dymoContextPath);
						callback(compacted);
					});
				});
			});
		});
	}

	//returns a jsonld representation of an object removed from any hierarchy of objects of the same type
	private toFlatJsonld(uri, callback) {
		var type = this.findObject(uri, TYPE);
		var triples = this.recursiveFindAllTriples(uri, type);
		this.triplesToJsonld(triples, uri, result => callback(null, JSON.parse(result)));
	}

	toJsonGraph(nodeClass, edgeProperty, callback) {
		var graph = {"nodes":[], "edges":[]};
		var nodeMap = {};
		var nodeUris = this.findAllSubjects(TYPE, nodeClass);
		var edgeTriples = this.find(null, edgeProperty, null);
		async.map(nodeUris, this.toFlatJsonld, function(err, result){
			graph["nodes"] = result;
			for (var i = 0; i < nodeUris.length; i++) {
				nodeMap[nodeUris[i]] = graph["nodes"][i];
			}
			graph["edges"] = [];
			for (var i = 0; i < edgeTriples.length; i++) {
				if (this.find(edgeTriples[i].object, TYPE, nodeClass).length == 0) {
					if (this.find(edgeTriples[i].object, FIRST).length > 0) {
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

	/*toJsonMappingGraph(callback) {
		var graph = {"nodes":[], "edges":[]};
		var nodeMap = {};
		var nodeUris = [];
		var edges = [];
		var mappingUris = store.findAllObjects(renderingUri, HAS_MAPPING);
		for (var i = 0; i < mappingUris.length; i++) {
			var domainDimUris = store.findAllObjects(mappingUris[i], HAS_DOMAIN_DIMENSION);
			for (var j = 0; j < domainDimUris.length; j++) {
				edges.push(domainDimUris, mappingUris[i])
			}
			var rangeUri = store.findObject(mappingUri, HAS_RANGE);
		}



		for (var i = 0; i < this.findAllSubjects(TYPE, nodeClass);
		var edgeTriples = this.find(null, edgeProperty, null);
		async.map(nodeUris, toFlatJsonld, function(err, result){
			graph["nodes"] = result;
			for (var i = 0; i < nodeUris.length; i++) {
				nodeMap[nodeUris[i]] = graph["nodes"][i];
			}
			graph["edges"] = [];
			for (var i = 0; i < edgeTriples.length; i++) {
				if (self.find(edgeTriples[i].object, TYPE, nodeClass).length == 0) {
					if (self.find(edgeTriples[i].object, FIRST).length > 0) {
						//it's a list!!
						var objects = self.findObjectOrList(edgeTriples[i].subject, edgeProperty);
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
