var io = require('socket.io').listen(8888);

var playerList = new Array();

function generateList()
{
	var tab = new Array();
	var i = 0;
	while (playerList[i] != undefined)
	{
		if (playerList[i]['out'] !== true && playerList[i]['login'] != undefined)
			tab.push(playerList[i]['login']);
		i++;
	}
	return tab;
}

var word;
var letters;
io.on('connection', function(socket)
{
	var player = {};
	player.key = socket.id;
	player.socket = socket;
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
	
	socket.on('word', function(word){
		letters = word.length;
		word = word;
		var secretWord = '_'*letters;
		io.emit("secretWord", secretWord);
	});

	socket.on('disconnect', function() {
		player.out = true;
		console.log('disconnect event');
		console.log(playerList);
	});
});

