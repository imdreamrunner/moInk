WebFont.load({
  custom: { families: ['Libre Baskerville'],
    urls: ['/fonts/LibreBaskerville.css']
  }
});

$(document).ready(function () {
  var $userBox =  $('#user-box');
  checkLoginStatus(function(loginStatus){
    if(loginStatus.isLogin){
      $userBox
        .html($('#user-box-logged-in').html())
        .find('.user-name').html(loginStatus.userInfo.name.first);
    }else{
      $userBox
        .html($('#user-box-log-in').html());
    }
  });


});

var checkLoginStatus = function(callback){
  $.ajax('/user/loginStatus', {
    cache: false,
    success: callback
  });
};