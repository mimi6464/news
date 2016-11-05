/* Scraper: 
 * ========================= */

// Dependencies:

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
var mongoose = require('mongoose');

//1======================================
var request = require('request'); // Snatches html from urls
var cheerio = require('cheerio'); // Scrapes our html


// first, tell the console what server.js is doing
console.log("\n***********************************\n" +
            "Grabbing every article headline and link\n" + 
            "from nationalgeographic.com. Then,\n" +
            "grab the image's source url." +
            "\n***********************************\n");


// Now, make a request call for the "webdev" board on reddit. 
// Notice: the page's html gets saved as the callback's third arg
console.log("fetching page")
request('http://news.nationalgeographic.com', function (error, response, html) {
  
  // Load the html into cheerio and save it to a var.
  // '$' becomes a shorthand for cheerio's selector commands, 
  //  much like jQuery's '$'.
  // console.log("parsing HTML")
  var $ = cheerio.load(html);

  // an empty array to save the data that we'll scrape
  var result = [];

  // With cheerio, find each "link" class
  
  $('h4.editorspicksitem-title').each(function(i, element){
      
      // save the text of the element (this) in a "title" variable
      var title = $(this).find('a').text();
      var link  = $(this).find('a').attr('href');
      
      // save these results in an object that we'll push
      // into the result array we defined earlier
      result.push({
        // linkImg: linkImg,
        title:title,
        link:link
      });
    });

  // log the result once cheerio analyzes each of its selected elements
  console.log(result);
});

// //2============================
// /* Scraping into DB (18.2.5)
//  * ========================== */

// // Initialize Express app
// // var express = require('express');
// // var app = express();

// // Require request and cheerio. This makes the scraping possible
// // var request = require('request');
// // var cheerio = require('cheerio');

// // Database configuration
// var mongojs = require('mongojs');
// var databaseUrl = "scraper";
// var collections = ["scrapedData"];

// // Hook mongojs configuration to the db variable

// var db = mongojs(databaseUrl, collections);
// db.on('error', function(err) {
//   console.log('Database Error:', err);
// });


// // Main route (simple Hello World Message)
// app.get('/', function(req, res) {
//   res.send();
// });

// // Retrieve data from the db
// app.get('/all', function(req, res) {
//   // find all results from the scraoedData collection in the db
//   db.scrapedData.find({}, function(err, found) {
//     // throw any errors to the console
//     if (err) {
//       console.log(err);
//     } 
//     // if there are no errors, send the data to the browser as a json
//     else {
//       res.json(found);
//     }
//   });
// });

// // Scrape data from one site and place it into the mongodb db
// app.get('/scrape', function(req, res) {
//   // make a request for the news section of ycombinator
//   request('https://news.nationalgeographic.com', function(error, response, html) {
//     // load the html body from request into cheerio
//     var $ = cheerio.load(html);
//     // for each element with a "title" class
//     $('.title').each(function(i, element) {
//       // save the text of each link enclosed in the current element
//      var title = $(this).find('a').text();
//       var link  = $(this).find('a').attr('href');

//       // if this title element had both a title and a link
//       if (title && link) {
//         // save the data in the scrapedData db
//         db.scrapedData.save({
//           title: title,
//           link: link
//         }, 
//         function(err, saved) {
//           // if there's an error during this query
//           if (err) {
//             // log the error
//             console.log(err);
//           } 
//           // otherwise, 
//           else {
//             // log the saved data
//             console.log(saved);
//           }
//         });
//       }
//     });
//   });

//   // this will send a "search complete" message to the browser
//   res.send("Scrape Complete");
// });

//3=========================================

set the app up with morgan, body-parser, and a static folder
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static('public'));

//Database configuration
var mongojs = require('mongojs');
var databaseUrl = "news";
var collections = ["articles"];

// hook mongojs config to db variable
var db = mongojs(databaseUrl, collections);

// log any mongojs errors to console
db.on('error', function(err) {
  console.log('Database Error:', err);
});


// Routes
// ======

// Simple index route
app.get('/', function(req, res) {
  res.send(index.html);
});

// Handle form submission, save submission to mongo
app.post('/submit', function(req, res) {
  console.log(req.body);
  // insert the note into the notes collection
  db.note.insert(req.body, function(err, saved) {
    // log any errors
    if (err) {
      console.log(err);
    } 
    // otherwise, send the note back to the browser.
    // this will fire off the success function of the ajax request
    else {
      res.send(saved);
    }
  });
});

// Retrieve results from mongo
app.get('/all', function(req, res) {
  // find all notes in the notes collection
  db.notes.find({}, function(err, found) {
    // log any errors
    if (err) {
      console.log(err);
    } 
    // otherwise, send json of the notes back to user.
    // this will fire off the success function of the ajax request
    else {
      res.json(found);
    }
  });
});

// Select just one note by an id
app.get('/find/:id', function(req, res){

  // when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

  // find just one result in the notes collection
  db.notes.findOne({
    // using the id in the url
    '_id': mongojs.ObjectId(req.params.id)
  }, function(err, found){
    // log any errors
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the note to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(found);
      res.send(found);
    }
  });
});


// Update just one note by an id
app.post('/update/:id', function(req, res) {
  
  // when searching by an id, the id needs to be passed in 
  // as (mongojs.ObjectId(IDYOUWANTTOFIND))

  // update the note that matches the object id
  db.notes.update({
    '_id': mongojs.ObjectId(req.params.id)
  }, {
    // set the title, note and modified parameters
    // sent in the req's body.
    $set: {
      'articles': req.body.articles,
      'note': req.body.note,
      'modified': Date.now()
    }
  }, function(err, edited) {
    // log any errors from mongojs
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // othewise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(edited);
      res.send(edited);
    }
  });
});


// Delete One from the DB
app.get('/delete/:id', function(req, res) {
  // remove a note using the objectID
  db.articles.remove({
    "_id": mongojs.ObjectID(req.params.id)
  }, function(err, removed) {
    // log any errors from mongojs
    if (err) {
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(removed);
      res.send(removed);
    }
  });
});


//Clear the DB
app.get('/clearall', function(req, res) {
  // remove every note from the articles collection
  db.articles.remove({}, function(err, response){
    // log any errors to the console
    if (err){
      console.log(err);
      res.send(err);
    } 
    // otherwise, send the mongojs response to the browser.
    // this will fire off the success function of the ajax request
    else {
      console.log(response);
      res.send(response);
    }
  });
});


// listen on port 3000
app.listen(3000, function() {
  console.log('App running on port 3000!');
});





