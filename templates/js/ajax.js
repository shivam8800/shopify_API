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
                if (json.status == "error"){
                    alert(json.message)
                }
                window.location.href = "http://localhost:8080/user/profile?email="+email;
            }
        });
    });

    $('#create_order').on('click', function(){
        var order_data = {};
        var title = $('#title').val()
        var price = $('#price').val()
        var quantity = $('#quantity').val()
        order_data.title = title
        order_data.price = parseInt(price)
        order_data.quantity = parseInt(quantity)
        console.log(order_data, "order_data")
        $.ajax({
            url : "/shopify/create/order",
            type : "POST",
            data: order_data,
            success : function(json){
                console.log(json, "order created")
                if (json.status == "error"){
                    alert(json.message)
                }
                window.location.href = "http://localhost:8080/user/profile";
            }
        });
    })
});


$(document).ready(function(){
    $('.get-data').on('click', function(){
        $('.bg02').empty()
        $('.get-data').empty()
        $('.get-data').append('Loading...')
        $.ajax({
            url : "/shopify/get/inventoryItems?limit=20",
            type : "GET",
            dataType: 'json',
            success : function(data){
                $('.get-data').empty()
                $('.get-data').append('View inventory Items data')
                var HTML = '<table id="example" class="table tableres table-striped table-bordered" style="width:100%"><thead><tr><th scope="col">sku</th><th scope="col">created_at</th><th scope="col">updated_at</th><th scope="col">cost</th><th scope="col">tracked</th><th scope="col">admin_graphql_api_id</th></tr></thead><tbody>';
                // open table here
                 for (var i = 0; i < data.length; i += 1) {
                    HTML += '<tr><td data-label="sku">'+data[i].sku+'</td><td data-label="created_at">'+data[i].created_at+'</td><td data-label="updated_at">'+data[i].updated_at+'</td><td data-label="cost">'+data[i].cost+'</td><td data-label="tracked">'+data[i].sku+'</td><td data-label="admin_graphql_api_id">'+data[i].admin_graphql_api_id+'</td></tr>'
                 }
                 HTML += '</tbody></table>';
                 $('#update-data').append(HTML);
                 // close table here
            },
            error : function(err){
                alert(err);
            }
        });
    });
});



$(document).ready(function(){
    $('.form-data').on('click', function(){
        $('#update-data').empty();
        $('.bg02').empty();
        var HTML = '';
            HTML = '<div class="container w-50 pt-5"><form role="form" action="/shopify/create/order" method="POST"><div class="form-group"><input name="title" class="form-control" type="text" id="title" required> <label class="form-label">title</label></div> <div class="form-group"><input name="price" class="form-control" type="text" id="price" required> <label class="form-label">price</label></div><div class="form-group"><input name="quantity" class="form-control" type="number" id="quantity" required> <label class="form-label">quantity</label></div><button type="submit" class="btn" id="create_order">Create</button></form></div>'
        $('.bg02').append(HTML);
    });
});