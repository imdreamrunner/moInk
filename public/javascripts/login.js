$(function(){
  $('#login-submit').on('click', function(){
    var userData = {};
    userData['email'] = $('#login-email').val();
    userData['password'] = hex_md5($('#login-password').val());
    $.ajax('/user/login', {
      data: userData,
      type: 'POST',
      success: function(res){
        console.log(res);
        if(res.err){
          // Todo Fail to login.
        }else{
          window.location.href = "/";
        }
      }
    });
  });
});