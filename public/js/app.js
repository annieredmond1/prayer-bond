// On page load
$(document).ready(function(){
  //check that javascript is working properly
  console.log('Javascript is working!');

  //validations
  $('#signUpForm').validate({
    rules: {
      email: {
        required: true,
        email: true
      },
      password: {
        required: true,
        minlength: 4
      },
      password2: {
        required: true,
        minlength: 4,
      }
    }
  });

  //variable to identify if user is logged in
  var owner;

  //check if user is logged in
  function checkAuth() {
    $.get('/api/current-user', function (data) {
      if (data.user || data.userId) {
        $('.not-logged-in').hide();
        $('.visitor').hide();
        owner = true;
      } else {
        $('.logged-in').hide();
        $('.owner').hide();
        owner = false;
      }
    });
  }

  checkAuth();

  //error handler function
  function errorHandler(msg, type) {
    //data.message //=> message: "Post validation failed"
    $('#alert').addClass('alert-danger').text(msg).fadeIn();
    setTimeout(function() { $('#alert').fadeOut(); }, 4000);
    $('#alert-sign-up').addClass('alert-danger').text(msg).fadeIn();
    setTimeout(function() { $('#alert-sign-up').fadeOut(); }, 4000);
    
  }

  //cookie function for prayed cookie - TODO
  function setPrayerCookie(requestId) {
   var now = new Date();
     now.setTime(now.getTime() + 60 * 1000); //Expire in one minute
     document.cookie = 'name' + requestId + '=1;path=/;expires='+ now.toGMTString()+';';
     console.log("cookie function ran");
   }

  //When sign up form submitted
  $('#signUpForm').on('submit', function(e) {
    e.preventDefault();
    //check if form is valid
    if ($('#signUpForm').valid()) {
      //set variable user to the serialized form data
      var user = $(this).serialize();
      //POST request
      $.ajax({
        url: '/api/users',
        type: "POST",
        data: user
      })
      //if POST request successfull
      .done(function(data) {
        //if request comes back with error status 404
        if (data.status == 404) {
          console.log("err message should activate");
          //set msg for error handler function
          var msg = "Email already in use";
          //run error handler function
          errorHandler(msg, 'alert-danger');
        } else {
          //if no error redirect to user's page
          window.location.href = "/users/" + data._id;
        }
      })
      //if POST request is unsuccessfull 
      .fail(function(err) {
        console.log("could not create user");
        //set msg for error handler function
        var msg = "Email already in use";
        //run error handler function
        errorHandler(msg, 'alert-danger');
      });
    }
  });

  //when log out button is clicked
  $('#log-out').on('click', function(e) {
    e.preventDefault();
    //GET request
    $.ajax({
      url: '/api/logout',
      type: "GET"
    })
    //when successfull
    .done(function(data) {
      //reload the page to guest view
      window.location.reload();
    });
  });

  // When user logs in
  $('#log-in').on('submit', function(e) {
    e.preventDefault();
    //set variable user to the serialized data from log in form
    var user = $(this).serialize();
    //POST reqeust
    $.ajax({
      url: '/api/login',
      type: "POST",
      data: user
    })
    //if POST request succesfull
    .done(function(data) {
      //if status is 404
      if (data.status == 404) {
        //set msg variable
        var msg = "Email or password not correct";
        //run error handler function
        errorHandler(msg, 'alert-danger');
      } else {
        //if login successfull redirect to user's page
        window.location.href = "/users/" + data._id;
      }
    })
    //if POST request failed
    .fail(function() {
      //set msg variable
      var msg = "Email or password not correct";
      //run error handler function
      errorHandler(msg, 'alert-danger');
    });

  });


  //When new prayer request is submitted
  $('#new-request').on('submit', function(e) {
  	e.preventDefault();
    //set userId variable with the user id from the data-id
    var userId = $('#new-request-input').attr('data-id');
    //set formData variable with the serialized input from the new-request-form
    var formData = $('#new-request-input').serialize();
    //set newRequest variable for value of new-request-form
    var newRequest = $( '#new-request-input').val();
    //reset form to be blank
    $('#new-request')[0].reset();
    //POST request
    $.ajax({
      url: '/api/users/' + userId + '/requests',
      type: "POST",
      data: formData
    })
    //if POST request successfull
    .done(function(request) {
      //reload the current page
      location.reload();
    });
  });

  //give form in modal a data-id based on the request
  $('.openModal').on('click', function() {
    //set id variable with the data-id of the current request
    var id = $(this).attr('data-id');
    //set the data-id attribute of the form in the modal with the id variable
    $('.answeredForm').attr('data-id', id);
  });

  //give form in modal a data-id based on the request
  $('.deleteModal').on('click', function() {
    //set id variable with the data-id of the current request
    var id = $(this).attr('data-id');
    //set the data-id attribute of the form in the modal with the id variable
    $('.deleteForm').attr('data-id', id);
  });

  // //When delete button is clicked remove post
  $('.deleteForm').on('submit', function(e) {
    e.preventDefault();
    //set requestId variable with the data-id of the current request
    console.log('this is: ', this); 
    var requestId = $(this).attr('data-id');
    console.log('requestId is: ', requestId);
    //set deleteRequest variable to the jquery item to be removed
    var deleteRequest = $('li[data-id="' + requestId + '"]');
    //set the userId to the data-id of the new request form
    var userId = $('#new-request-input').attr('data-id');
    //DELETE request
    $.ajax({
      url: '/api/users/' + userId + '/requests/' + requestId,
      type: "DELETE"
    })
    //if DELETE request successfull
    .done(function (data) {
      //trigger a click on the delete-modal
      $('#delete-modal').trigger('click');
      //remove the deleteRequest(variable defined above)
      $(deleteRequest).remove();
      console.log('now request is: ', requestId);
    });
  });

  //When mark as answered button is clicked 
  $('.answeredForm').on('submit', function(e) {
    e.preventDefault();
    //set requestId variable with the data-id of the current request
    var requestId = $(this).attr('data-id');
    //set answerRequest variable to the jquery item to be removed
    var answerRequest = $('li[data-id="' + requestId + '"]');
    //set the userId to the data-id of the new request form
    var userId = $('#new-request-input').attr('data-id');
    //set formData variable with the serialized input from the update field of form
    var formData = $('#inputAnswered').serialize();
    //set update variable to the value of the update field of form
    var update = $('#inputAnswered').val();
    //PUT request
    $.ajax({
      url: '/api/users/' + userId + '/requests/' + requestId,
      type: "PUT",
      data: formData
    })
    //if PUT request successfull
    .done(function(data) {
      //trigger a click on the close-modal
      $('#close-modal').trigger('click');
      //remove the answer button from the request
      answerRequest.find('button.openModal').remove();
      //change the opacity to .5
      answerRequest.css("opacity", "0.5");
      //prepend answered prayer to top of request
      answerRequest.prepend('<h4>Answered Prayer:</h4>');
      //append update to the end of the request
      answerRequest.append('<p><strong>Update:</strong> ' + update + '</p>');
    });
  });   

  //When prayed for button is clicked
  $('.requests').on('click', '.count', function() {
    //set prayerRequest variable to the nearest li
    var prayerRequest = $(this).closest('li');
    //set the userId to the data-id of the new request form
    var userId = $('#new-request-input').attr('data-id');
    //set requestId variable to the data-id of the prayer request
    var requestId = prayerRequest.attr('data-id');
    //set num variable to the text in the pray-count class of list item
    var num = prayerRequest.find('span.pray-count').text();
    //set numInt variable to be the integer of num
    var numInt = parseInt(num, 10);
    //add one to the numInt
    numInt++;
    //set numString variable to turn numInt back into a string
    numString = numInt.toString();
    //update the pray-count to numString

    //PUT request
    $.ajax({
      url: '/api/users/' + userId + '/requests/count/' + requestId,
      type: "PUT"
    })
    //if PUT request successfull
    .done(function(data) {
      //update the prayer count number 
      prayerRequest.find('span.pray-count').text(numString);
    });
  });

});