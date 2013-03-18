var submitForm = function () {
  $('#alert').html('Sending data...').removeClass('hidden');
  if ($('#password').val() != $('#password2').val()) {
    $('#alert').html('Two passwords are different.').addClass('alert-error');
    return false;
  }
  var userData = {};
  userData['id'] = $('#user-id').val();
  userData['firstName'] = $('#firstname').val();
  userData['lastName'] = $('#lastname').val();
  userData['email'] = $('#email').val();
  if ($('#password').val() && $('#password').val() != '') {
    userData['password'] = hex_md5($('#password').val());
  }
  $.ajax('/user/settings', {
    data: userData,
    type: 'POST',
    success: function(res){
      if(res.err){
        $('#alert').html(res.msg || 'Unknown error.').removeClass('alert-success').addClass('alert-error');
      }else{
        $('#alert').removeClass('alert-error').addClass('alert-success')
          .html('All changes are saved.');
        if ($('#password').val() && $('#password').val() != '') {
          window.location.href = '/user/logout';
        }
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