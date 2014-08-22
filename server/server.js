var io = require('socket.io').listen(8888);

var playerList = new Array();

function generateList()
{
	var tab = new Array();
	var i = 0;
	while (playerList[i] != undefined)
	{
		if (playerList[i]['out'] !== true && playerList[i]['login'] != undefined)
		{
			var user = {};
			user.login = playerList[i]['login'];
			user.score = 0;
			if (i == 0) {
				user.admin = true;
			}
			tab.push(user);
		}
		i++;
	}
	return tab;
}

var currentWord;
var letters;
io.on('connection', function(socket)
{
	var player = {};
	player.key = socket.id;
	player.socket = socket;
	console.log("new");

	socket.on('login', function(login)
	{
		playerList.push(player);
		player.login = login;
		console.log("bonjour "+login);
		socket.emit("new_user", login);
		io.emit("playerList", generateList());
		console.log(playerList);
	});
	
	socket.on('word', function(word){
		player.secretWord = word;
		letters = word.length;
		currentWord = word;
		var secretWord = "";
		var i = 0;
		while (i < letters)
		{
			secretWord += "_";
			i++;
		}
		io.emit("secretWord", secretWord);
	});

	socket.on('disconnect', function() {
		player.out = true;
		console.log('disconnect event');
		console.log(playerList);
	});
});

