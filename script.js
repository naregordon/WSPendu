var socket = io('localhost:8888');

var login = prompt('quel est votre nom ?');

socket.emit("login", login);

socket.on("new_user", function(user){
	$('#user').html('bonjour ' + user);
	$('#users').append(user);
});