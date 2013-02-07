$(function(){
  $('#create-new').on('click', function(){
    $.ajax('/user/newDesign', {
      type: 'POST',
      data: {
        title: $('#create-new-title').val()
      },
      success: function(result){
        console.log(result);
      }
    });
  });
});