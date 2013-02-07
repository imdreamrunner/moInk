$(function(){
  checkLoginStatus(function(loginStatus){
    console.log(loginStatus);
    if(loginStatus.isLogin){
      $('#user-box')
        .html($('#user-box-logged-in').html())
        .find('.user-name').html(loginStatus.userInfo.name.first);
    }else{
      $('#user-box')
        .html($('#user-box-log-in').html());
    }
  });
});

var checkLoginStatus = function(callback){
  $.ajax('/user/loginStatus', {
    cache: false,
    success: callback
  });
}