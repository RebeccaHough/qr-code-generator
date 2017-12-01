var qrCodeGenerator = require('qrcode')
var fs = require('fs');

//get command line arguments
input = process.argv[2];

//test whether input was a path to a file or a JSON string
validatedInput = validateJSON(input);
//if validation is unsuccesful, the original input will be returned hence the below means: if(input_is_not_JSON)
if(validatedInput === input) {
    //assume input is a file and attempt to open it
    fs.readFile(input, 'utf8', function(err, input) {
        //if file cannot be opened
        if (err) {
            console.log("Could not read file. If input was intended to be raw JSON, please ensure that it is surrounded by single quote marks (').");
            throw err;
        }
        console.log("File opened.");

        //check input is valid json
        validatedInput = validateJSON(input);
        //if validation is unsuccesful, the original input will be returned hence the below means: if(input_is_not_JSON)
        if(validatedInput === input) {
            throw "Input file does not contain valid JSON";
        } else {
            verifyJSON(validatedInput);
            //if checks succeed, create qr codes
            generateQrCodes(validatedInput);
        }
    }); 
} else {
    //else command line arg was valid JSON
    //so check it against schema
    verifyJSON(validatedInput);
    //if checks succeed, create qr codes
    generateQrCodes(validatedInput);
}

/** 
 * Check whether the input string is a valid JSON object, then cast it to a JavaScript object if possible 
 * @param {string} input - input to be validated
 * @return input as a JavaScript object if the cast from JSON was possible, or the orginal input if the cast was not possible
 */
function validateJSON(input) {
    try {
        input = JSON.parse(input);
        return input;
    } catch(e) {
        return input;
    }
}

/**
 * Check input follows the schema, and halt execution if deviation from schema is present
 * @param {Object} input - input to be verified
 */
function verifyJSON(input) {
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
}

/**
 * For each member of the input.hits.hits array, create a QR code PNG of its '_source' property and store it in an output folder
 * @param {Object} input - input to be converted to QR codes. Must have a property names 'hits' which has an array named 'hits' as a property, each member of which must have a property named '_source'
 */
function generateQrCodes(input) {
    //extract 'hits' array
    var hits = input.hits.hits;
    //for each JavaScript object in hits
    var i;
    for(i = 0; i < hits.length; i++) {
        //cast back to JSON and reduce amount of code needed to access _source objects
        hits[i] = JSON.stringify(hits[i]._source);
        //DEBUG console.log(hits[i]);
        //create qr code
        var date = new Date().valueOf();
        qrCodeGenerator.toFile("./output/qr-code-created-" + date + ".png", hits[i], function(err) {
            if (err) throw err;
        });
    }
    console.log("Successfully created (" + i + ") files.");
}