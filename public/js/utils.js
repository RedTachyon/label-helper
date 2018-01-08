function linspace(min, max, num) {
    return _.range(min, max, (max - min) / num);
}

function updateWith(array, newArray) {
    for (let i = 0; i <= array.length; i++) {
        array[i] = newArray[i];
    }
}

function sendData(data) {
    let XHR = new XMLHttpRequest();
    let urlEncodedData;
    let urlEncodedDataPairs = [];
    let name;

    // Turn the data object into an array of URL-encoded key/value pairs.
    for(name in data) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
    }
    // Combine the pairs into a single string and replace all %-encoded spaces to
    // the '+' character; matches the behaviour of browser form submissions.
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
    // Define what happens on successful data submission
    XHR.addEventListener('load', function(event) {
        //alert('Yeah! Data sent and response loaded.');
    });
    // Define what happens in case of error
    XHR.addEventListener('error', function(event) {
        alert('Oups! Something goes wrong.');
    });
    // Set up our request
    XHR.open('POST', '/data');
    // Add the required HTTP header for form data POST requests
    XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // Finally, send our data.
    XHR.send(urlEncodedData);
}
