$(document).ready(function(){
	var socket = io('192.168.1.93:8888');

	var login = prompt('quel est votre nom ?');

	socket.emit("login", login);

	socket.on("new_user", function(user){
		$('#user').html('Bonjour ' + user);
	});

	socket.on("playerList", function(playerList) {
		var i = 0;
		console.log(playerList);
		$(".other").empty();
		while(i < playerList.length) {
			$(".other").append("<h2>"+playerList[i]['login']+"</h2>");
			i++;
		}
	})
});
