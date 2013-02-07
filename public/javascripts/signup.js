$(function(){
  $('#submit').on('click', function(){
    var userData = {};
    userData['firstName'] = $('#firstname').val();
    userData['lastName'] = $('#lastname').val();
    userData['email'] = $('#email').val();
    userData['password'] = hex_md5($('#password').val());
    $.ajax('/user/signup', {
      data: userData,
      type: 'POST',
      success: function(res){
        console.log(res);
        if(res.err){
          // Todo Fail to login.
        }else{
          window.location.href = "/user/login";
        }
      }
    });
  });
});