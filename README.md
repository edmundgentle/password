Password
========

jQuery plugin which checks passwords live against a set of criteria including personal information and dictionary words.


Usage
-----

    $('#password').password();

More settings include:

    $('#password1').password({
        minLength:8, //the minimum length of the password
        allowSpace:false, //whether or not a space character is allowed in the password
        strengthIndicator:$('#myStrengthMeter'), //the element to turn into a strength meter
        checklist:$('#myChecklist'), //the element to turn into a checklist
        dictionary:'../src/dictionaries/en.js', //a JSON file which has a list of disallowed words
        doubleType:$('#password2'), //a second password field to allow for double typing checking
        personalInformation:[ //personal information to stop the user from using
            $('#name'), //can be elements
            '2nd December 1992' //or strings
        ],
        change:function(score, issues, pass) { //the function which is called when the password changes
            $('#feedback').html('<strong>Score:</strong> '+Math.round(score)+'<br /><strong>Problems:</strong> '+issues.join(', ')+'<br /><strong>Passed?:</strong> '+pass);
        }
    });
