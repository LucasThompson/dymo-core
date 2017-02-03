import * as math from 'mathjs'
import * as _ from 'lodash'
import { HAS_FEATURE, TYPE, CONTEXT_URI } from '../globals/uris'
import { StructureInducer } from '../structure/structure'
import { Similarity } from '../structure/similarity'
import { Quantizer } from '../structure/quantizer'

export module DymoStructureInducer {

  //adds a hierarchical structure to the subdymos of the given dymo in the given store
  export function addStructureToDymo(dymoUri, store, options) {
    var surfaceDymos = getAllParts([dymoUri], store);
    var points = toVectors(surfaceDymos, store);
    var stucture = new StructureInducer(points, options.heuristic, options.overlapping);
    var occurrences = stucture.getOccurrences(options.patternIndices);
    var patternDymos = [];
    for (var i = 0; i < occurrences.length; i++) {
      var dymoUris = occurrences[i].map(occ => occ.map(index => surfaceDymos[index]));
      var features = store.findAllObjects(dymoUris[0][0], HAS_FEATURE).map(f => store.findObject(f, TYPE));
      for (var j = 0; j < dymoUris.length; j++) {
        var currentPatternDymo = store.addDymo((CONTEXT_URI+"pattern"+i)+j, dymoUri);
        patternDymos.push(currentPatternDymo);
        //console.log(dymoUris[j], occurrences[j])
        dymoUris[j].forEach(d => store.addPart(currentPatternDymo, d));
        var avgFeatureVals = dymoUris[j].map(d => features.map(f => store.findFeatureValue(d, f)));
        //remove multidimensional features
        features = features.filter((f,i) => avgFeatureVals[0][i].constructor !== Array);
        avgFeatureVals = avgFeatureVals.map(vs => vs.filter(v => v.constructor !== Array));
        avgFeatureVals = math.mean(avgFeatureVals, 0);
        //console.log(avgFeatureVals);
        avgFeatureVals.forEach((v,k) => store.setFeature(currentPatternDymo, features[k], v));
      }
    }
    store.setParts(dymoUri, patternDymos);
  }

  //adds similarity relationships to the subdymos of the given dymo in the given store
	export function addSimilaritiesTo(dymoUri, store, threshold) {
		var currentLevel = [dymoUri];
		while (currentLevel.length > 0) {
			if (currentLevel.length > 1) {
				var vectorMap = toNormVectors(currentLevel, store);
				var similarities = this.getCosineSimilarities(vectorMap);
				//this.addHighestSimilarities(store, similarities, currentLevel.length/2);
				this.addSimilaritiesAbove(store, similarities, threshold);
			}
			currentLevel = this.getAllParts(currentLevel, store);
		}
	}

	//adds navigatable graph based on similarity relationships to the subdymos of the given dymo in the given store
	export function addSuccessionGraphTo(dymoUri, store, threshold) {
		var currentLevel = [dymoUri];
		while (currentLevel.length > 0) {
			if (currentLevel.length > 1) {
				//add sequential successions
				for (var i = 0; i < currentLevel.length-1; i++) {
					store.addSuccessor(currentLevel[i], currentLevel[i+1]);
				}
				//add successions based on similarity
				var vectorMap = this.toNormVectors(currentLevel, store);
				var similarities = this.getCosineSimilarities(vectorMap);
				for (var uri1 in similarities) {
					for (var uri2 in similarities[uri1]) {
						if (similarities[uri1][uri2] > threshold) {
							Similarity.addSuccessorToPredecessorOf(uri1, uri2, currentLevel, store);
							Similarity.addSuccessorToPredecessorOf(uri2, uri1, currentLevel, store);
						}
					}
				}
			}
			currentLevel = this.getAllParts(currentLevel, store);
		}
	}

  export function getAllParts(dymoUris, store) {
		var parts = [];
		for (var i = 0, l = dymoUris.length; i < l; i++) {
			parts = parts.concat(store.findParts(dymoUris[i]));
		}
		return parts;
	}

  /**
	 * returns a map with a normalized vector for each given dymo. if reduce is true, multidimensional ones are reduced
	 */
	export function toNormVectors(dymoUris, store, reduce?: boolean) {
		var vectors = toVectors(dymoUris, store, reduce);
    vectors = new Quantizer(null).normalize(vectors);
		//pack vectors into map so they can be queried by uri
		var vectorsByUri = {};
		for (var i = 0; i < vectors.length; i++) {
			vectorsByUri[dymoUris[i]] = vectors[i];
		}
		return vectorsByUri;
	}

  /**
	 * returns a map with a vector for each given dymo. if reduce is true, multidimensional ones are reduced
	 */
	export function toVectors(dymoUris, store, reduce?: boolean): number[][] {
		var vectors = [];
		for (var i = 0, l = dymoUris.length; i < l; i++) {
			var currentVector = [];
			var currentFeatures = store.findAllFeatureValues(dymoUris[i]).filter(v => typeof v != "string");
			for (var j = 0, m = currentFeatures.length; j < m; j++) {
				var feature = currentFeatures[j];
				//reduce all multidimensional vectors to one value
				if (reduce && feature.length > 1) {
					feature = this.reduce(feature);
				}
				if (feature.length > 1) {
					currentVector = currentVector.concat(feature);
				} else {
					feature = Number(feature);
					currentVector.push(feature);
				}
			}
			vectors[i] = currentVector;
		}
		return vectors;
	}

  //TODO ADD TO QUANTIZER? or other tool i guess.. its against float errors
  function getRoundedSum(a, b) {
    return _.zipWith(a, b, (a,b) => _.round(a+b), 1);
    //a.map((ai,i) => _.round(ai + b[i]), 1);
    //_.zipWith(a, b, _.flow([_.add, _.round.curryRight(1)]);
  }

}