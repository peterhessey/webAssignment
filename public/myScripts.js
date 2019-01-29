var loggedIn = ""
function registerHandler (){
  $.ajax({
    url:"/people",
    type:"POST",
    headers: {
      "username": $('#unameReg').val(),
      "forename": $('#forenameReg').val(),
      "surname": $('#surnameReg').val(),
      "password": $('#passwordReg').val(),
      "access_token" : "concertina"
    },
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      var response = data["response"];
      $('#unameReg').val('');
      $('#forenameReg').val('');
      $('#surnameReg').val('');
      $('#passwordReg').val('');
      alert(response);

    },
    statusCode: {
      400: function() {
        $('#regResult').html("Username already taken.");
      },
      403:function(){
        $('#regResult').html("Invalid token.");
      }
    }
  });

  return false;
}

function loginHandler(){

  $.ajax({
    url:"/login",
    type:"POST",
    data: JSON.stringify({
      "username": $('#unameLogin').val(),
      "password": $('#pwdLogin').val()
    }),
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      var token = data["token"];

      $.ajaxSetup({
        headers : {"Authorization": "bearer " + token}
      });

      loggedIn = $('#unameLogin').val();
      updateGreeting($('#unameLogin').val());
      $('#unameLogin').val('');
      $('#pwdLogin').val('');
      document.getElementById('modalLogin').style.display='none';
    }
  });
  return false;

}

function submitReview(){

  $.ajax({
    type:"POST",
    url:"/comments",
    data: JSON.stringify({
      "username": loggedIn,
      "review": $('#reviewInput').val()
    }),
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      updateReviews(data["reviews"]);
    },
    error: function(){
      alert("Please log in to use this function.");
    }

  })
  return false;

}



function updateGreeting(user){
  if (typeof user !== undefined){
    var greeting = "<a href=\"#\">Welcome, " + user + "!</a>"
    $('#loginBtn').html(greeting);
  }
}

function loadContent(){
  $.ajax({

    type:"GET",
    url:"/comments",
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      updateReviews(data["reviews"]);
    },

  })
  return false;
}

function updateReviews(reviews){
  var reviewHtml = "";
  var i = 0;

  for(i=0;i<reviews.length;i++){
    reviewHtml += "<div class='row'>\n<div class='col-xs-1'></div>\n<div class='review col-xs-7'>\n<h4>" + reviews[i][0] + "</h4>\n<hr>\n<p>" + reviews[i][1] + "</p>\n</div>\n<div class='col-xs-4'></div>\n</div>\n"

  }
  $('#reviews').html(reviewHtml);

}

$('#regForm').on('submit', registerHandler);
$('#loginForm').on('submit', loginHandler);
$('#reviewForm').on('submit', submitReview);
