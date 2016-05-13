$(function()
{

function login(){
	$.ajax(
    {
      url     : 'auth/facebook',
      type    : 'GET', 
      data    : '', 
      dataType  : "json",
      contentType: "application/json; charset=utf-8"
    }).done(function(data)
    { 
    	console.log(data);
    }); 
}
 
 $('#login').click(function(event)
  {
    login();
  });


});