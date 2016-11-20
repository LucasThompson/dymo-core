export function loadFile(path, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', path, true);
	/** @this {Object} */
	request.onload = () => callback(request.responseText);
	request.send();
}
