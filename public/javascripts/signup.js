var submitForm = function () {
  $('#alert').html('Sending data...').removeClass('hidden');
  if ($('#password').val() != $('#password2').val()) {
    $('#alert').html('Two passwords are different.').addClass('alert-error');
    return false;
  }
  var userData = {};
  userData['firstName'] = $('#firstname').val();
  userData['lastName'] = $('#lastname').val();
  userData['email'] = $('#email').val();
  userData['password'] = hex_md5($('#password').val());
  $.ajax('/user/signup', {
    data: userData,
    type: 'POST',
    success: function(res){
      if(res.err){
        $('#alert').html(res.msg || 'Unknown error.').addClass('alert-error');
      }else{
        $('#alert').addClass('alert-success')
          .html('Account is successfully created. <a href="/user/login">Login</a> now!');
      }
    }
  });

}

$(function(){
  $('#user-info').on('submit', function (e) {
    e.preventDefault();
    submitForm();
  });
});