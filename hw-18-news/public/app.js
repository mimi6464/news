
// grab the articles as a json
$.getJSON('/articles', function(data) {
  // for each one
  for (var i = 0; i<data.length; i++){
    // display the apropos information on the page
    $('#articles').append('<p data-id="' + data[i]._id + '">'+ data[i].title + '<br />'+ '</p>'+ '<a href ='+ data[i].link + data[i].link '> '+ '</a>'
      );
  }
});


// whenever someone clicks a p tag
$(document).on('click', 'p', function(){
  // empty the notes from the note section
  $('#notes').empty();
  // save the id from the p tag
  var thisId = $(this).attr('data-id');

  // now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })
    // with that done, add the note information to the page
    .done(function( data ) {
      console.log(data);
      // the title of the article
      $('#notes').append('<h4>' + data.title + '</h4>'); 
      // an input to enter a new title
      $('#notes').append('<input id="articlesinput" name="articles" >'); 
      // a textarea to add a new note body
      $('#notes').append('<textarea id="bodyinput" name="body"></textarea>'); 
      // a button to submit a new note, with the id of the article saved to it
      $('#notes').append('<button data-id="' + data._id + '" id="savenote">Save Note</button>');

      // if there's a note in the article
      if(data.note){
        // place the title of the note in the title input
        $('#articlesinput').val(data.note.title);
        // place the body of the note in the body textarea
        $('#bodyinput').val(data.note.body);
      }
    });
});

// when you click the savenote button
$(document).on('click', '#savenote', function(){
  // grab the id associated with the article from the submit button
  var thisId = $(this).attr('data-id');

  // run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      articles: $('#articlesinput').val(), // value taken from title input
      body: $('#bodyinput').val() // value taken from note textarea
    }
  })
    // with that done
    .done(function( data ) {
      // log the response
      console.log(data);
      // empty the notes section
      $('#notes').empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $('#articlesinput').val("");
  $('#bodyinput').val("");
});







 /* front-end
 * ==================== */ 

// Loads results onto the page
function getResults(){
  // empty any results currently on the page
  $('#results').empty();
  // grab all of the current notes
  $.getJSON('/all', function(data) {
    // for each note...
    for (var i = 0; i<data.length; i++){
      // ...populate #results with a p-tag that includes the note's article
      // and object id.
      $('#results').prepend('<p class="dataentry" data-id=' +data[i]._id+ '><span class="dataArticles" data-id=' +data[i]._id+ '>' + data[i].articles + '</span><span class=deleter>X</span></p>');
    }
  });
}

// runs the getResults function as soons as the script is executed
getResults();

// when the #makenew button is clicked
$(document).on('click', "#makenew", function(){
  // AJAX POST call to the submit route on the server. 
  // This will take the data from the form and send it
  // to the server. 
  $.ajax({
    type: "POST",
    dataType: "json",
    url: '/submit',
    data: {
      articles: $('#articles').val(),
      note: $('#note').val(),
      created: Date.now()
    }
  })
  // If that API call succeeds, 
  // add the article and a delete button for the note to the page
  .done(function(data){
    // add the article and delete button to the #results section
    $('#results').prepend('<p class="dataentry" data-id=' + data._id + '><span class="dataArticles" data-id=' +data._id+ '>' + data.articles + '</span><span class=deleter>X</span></p>');
    // clear the note and article inputs on the page
    $('#note').val("");
    $('#articles').val("");
  }
  );
});

// when the #clearall button is pressed
$('#clearall').on('click', function(){
  // make an AJAX GET request to delete the notes from the db
  $.ajax({
    type: "GET",
    dataType: "json",
    url: '/clearall',
    // on a successful call, clear the #results section
    success: function(response){
      $('#results').empty();
    }
  });
});


// when user clicks the deleter button for a note
$(document).on('click', '.deleter', function(){
  // save the p tag that encloses the button
  var selected = $(this).parent();
  // make an AJAX GET request to delete the specific note 
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: '/delete/' + selected.data('id'), 

    // on successful call
    success: function(response){
      // remove the p-tag from the DOM
      selected.remove();
      // clear the note and article inputs
      $('#note').val("");
      $('#articles').val("");
      // make sure the #actionbutton is submit (in case it's update)
      $('#actionbutton').html('<button id="makenew">Submit</button>');
    }
  });
});

// when user click's on note article, show the note, and allow for updates
$(document).on('click', '.dataTitle', function(){
  // grab the element
  var selected = $(this);
  // make an ajax call to find the note
  // this uses the data-id of the p-tag, which is linked to the specific note
  $.ajax({
    type: "GET",
    url: '/find/' + selected.data('id'),
    success: function(data){
      // fill the inputs with the data that the ajax call collected
      $('#note').val(data.note);
      $('#article').val(data.article);
      // make the #actionbutton an update button, so user can
      // update the note s/he chooses
      $('#actionbutton').html('<button id="updater" data-id="'+ data._id +'">Update</button>');
    }
  });
});

// when user click's update button, update the specific note
$(document).on('click', '#updater', function(){
  // save the selected element
  var selected = $(this);
  // Make an AJAX POST request.
  // This uses the data-id of the update button, 
  // which is linked to the specific note article 
  // that the user clicked before
  $.ajax({
    type: "POST",
    url: '/update/' + selected.data('id'),
    dataType:"json",
    data: {
      article: $('#article').val(),
      note: $('#note').val()
    },
    // on successful call
    success: function(data){
      // clear the inputs
      $('#note').val("");
      $('#article').val("");
      // revert action button to submit
      $('#actionbutton').html('<button id="makenew">Submit</button>');
      // grab the results from the db again, to populate the DOM.
      getResults();
    }
  });
});

