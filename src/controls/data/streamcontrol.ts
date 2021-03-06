import { DataControl } from '../datacontrol';
import { DymoStore } from '../../io/dymostore';

/**
 * A control based on data streams
 */
export class DataStreamControl extends DataControl {

//Rx.Node.fromReadableStream(fetch('https://stream.meetup.com/2/rsvps').then(r=>{console.log(r.body);return r.body}))

	constructor(uri: string, store: DymoStore) {
		super(uri, "", "", store);

		/*var requestStream = Rx.Observable.just('https://stream.meetup.com/2/open_events');

		var responseStream = requestStream
			.flatMap(function(requestUrl) {
				return Rx.Observable.fromPromise(fetch(requestUrl));
			})
			.map(r => r.body)
			.flatMap(s => Rx.Node.fromReadableStream(s));

		responseStream
			.subscribe(
				x => console.log(x),
				err => console.log(err),
				() => console.log("complete")
			);*/

	}

}
