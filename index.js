var qrCodeGenerator = require('qrcode')
var fs = require('fs');

//expect file to look like:
//id, 1, 
//name, a, 
//type, typeA; //<---- qr code separator
//id, 2, 
//name, b, 
//type, typeB


fs.readFile('input.csv', 'utf8', function(err, input){
    if (err) throw err;
    //DEBUG console.log(input);

    //split input into one JSON object per qr code
    var qrCodeArr = [], qrCodeCount = 0, nextChar;
    //for each char in input
    for(var charCount = 0; charCount < input.length; charCount++) {
        nextChar = input.charAt(charCount);
        //if new qr code
        if(nextChar == ';') {
            qrCodeArr[qrCodeCount] += "\" }"; //close current object
            qrCodeCount++; //create new array element
            charCount++; //skip newline
        } else {
            //replace newlines with commas
            if(nextChar != '\n') {
                //replace commas with colons
                if(nextChar != ',') {
                    //if array element is unintialised
                    if(qrCodeArr[qrCodeCount] == undefined) {
                        //start new JSON object
                        qrCodeArr[qrCodeCount] = "{ \"" + nextChar;
                    } else {
                        //add next char to current JSON object
                        qrCodeArr[qrCodeCount] += nextChar;
                    }
                } else {
                    qrCodeArr[qrCodeCount] += "\": \"";
                }
            } else {
                qrCodeArr[qrCodeCount] += "\" , \"";
            }
        } 
    }
    //close final JSON object (since input file is not expected to end in a semicolon)
    qrCodeArr[qrCodeCount] += "\" }";

    //error checking
    //DEBUG console.log(qrCodeArr);
    if(qrCodeArr == undefined) throw "file contents not in expected format";
    for(var i = 0; i < qrCodeArr.length; i++) {
        try {
            //DEBUG console.log(qrCodeArr[i]);
            var test = JSON.parse(qrCodeArr[i]);
            //DEBUG console.log(test);
        } catch(e) {
            throw "cannot convert file contents to valid JSON";
        }
    }

    //convert output to qr code and download
    var i;
    for(i = 0; i < qrCodeArr.length; i++) {
        var date = new Date().valueOf();
        console.log(date);
        qrCodeGenerator.toFile("qr code created " + date + ".png", qrCodeArr[i], function(err) {
            if (err) throw err;
        });
    }
    console.log("Successfully created (" + i + ") files.");
}) 

