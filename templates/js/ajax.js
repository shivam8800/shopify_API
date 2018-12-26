$(document).ready(function(){
	$('.submit').on('click', function(){
        var data = {}
        var email = $('.email').val()
        var password = $('.password').val()
        data.email = email
        data.password = password
        // console.log(data)
         $.ajax({
            url : "/post/login",
            type : "POST",
            data: data,
            success : function(json){
                console.log(json)
                window.location.href = "http://localhost:8080/user/profile?email="+email;
            },
            error : function(err){
                alert(err);
            }  
        });
    })
});
