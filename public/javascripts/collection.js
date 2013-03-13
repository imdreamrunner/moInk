function delete_design (objectId) {
  console.log(objectId);
  $.ajax('/user/delete', {
    type: 'POST',
    data: {
      id: objectId
    },
    success: function(result){
      console.log(result);
    }
  });
}

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

