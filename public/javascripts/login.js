var submitForm = function () {
  $('#alert').html('Sending data...').removeClass('hidden');
  var userData = {};
  userData['email'] = $('#login-email').val();
  userData['password'] = hex_md5($('#login-password').val());
  $.ajax('/user/login', {
    data: userData,
    type: 'POST',
    success: function(res){
      if(res.err){
        $('#alert').html(res.msg || 'Unknown error.').addClass('alert-error');
      }else{
        $('#alert').addClass('alert-success').html('You have logged in successfully!');
        window.location.href = redirect_url;
      }
    }
  });

}

$(function(){
  $('#login-form').on('submit', function (e) {
    e.preventDefault();
    submitForm();
  });
});