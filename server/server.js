var io = require('socket.io').listen(8888);

var playerList = new Array();

function generateList()
{
	var tab = new Array();
	var i = 0;
	while (playerList[i] != undefined)
	{
		if (playerList[i]['out'] !== true && playerList[i]['login'] != undefined)
			tab.push(playerList[i]);
		i++;
	}
	return tab;
}

io.on('connection', function(socket)
{
	var player = {};
	player.key = socket.id;
	playerList.push(player);
	console.log("new");

	socket.on('login', function(login)
	{
		player.login = login;
		console.log("bonjour "+login);
		socket.emit("new_user", login);
		io.emit("playerList", generateList());
		console.log(playerList);
	});


	playerList[0].socket.emit('firstPlayer');
	
	socket.on('word', function(word){
		var letters = word.length;
	});

	socket.on('disconnect', function() {
		player.out = true;
		console.log('disconnect event');
		console.log(playerList);
	});
});

