var qrCodeGenerator = require('qrcode')
var fs = require('fs');

//the test file, 'input.json', shows the expected format

fs.readFile('input.json', 'utf8', function(err, input){
    if (err) throw err;
    //DEBUG console.log(input);

    //error checking

    //check input is valid json
    try {
        //(if successful, keep cast to javascript object for easier processing)
        input = JSON.parse(input);
    } catch(e) {
        throw "Input file is not valid JSON";
    }
    //check input follows schema
    //check hits field exists
    if(!input.hasOwnProperty('hits')) throw "Invalid JSON format: no property 'hits' found"
    //check hits field has a field hits
    if(!input.hits.hasOwnProperty('hits')) throw "Invalid JSON format: no property 'hits' found on 'hits'"
    //check this hits field is an array
    if(!(input.hits.hits instanceof Array)) throw "Invalid JSON format: property 'hits' on 'hits' is not an array"
    //check that the hits array is not empty
    if(input.hits.hits.length < 1) throw "Invalid JSON format: property 'hits' on 'hits' is an empty array"
    for(var i = 0; i < input.hits.hits.length; i++) {
        //check that every member of the input.hits.hits array has an element '_source'
        if(!input.hits.hits[i].hasOwnProperty('_source')) throw "Invalid JSON format: one or more members of 'hits' array does not have an element '_source'"
        //check that _source array is not empty
        if(input.hits.hits[i]._source.length < 1) throw "Invalid JSON format: property '_source' on 'hits' is empty"
        //check that _source has all required propeties
        if(!input.hits.hits[i]._source.hasOwnProperty('guid') || !input.hits.hits[i]._source.hasOwnProperty('aliases') || !input.hits.hits[i]._source.hasOwnProperty('carton_size')) throw "Invalid JSON format: one or more properties '_source' on 'hits' does not have all properties required by schema"
    }

    //if input.json passes all checks, generate QR codes

    //extract 'hits' array
    var hits = input.hits.hits;
    //for each javascript obj in hits
    var i;
    for(i = 0; i < hits.length; i++) {
        //cast back to json
        hits[i] = JSON.stringify(hits[i]._source);
        //DEBUG console.log(hits[i]);
        //create qr code
        var date = new Date().valueOf();
        qrCodeGenerator.toFile("./output/qr-code-created-" + date + ".png", hits[i], function(err) {
            if (err) throw err;
        });
    }
    console.log("Successfully created (" + i + ") files.");
}) 

