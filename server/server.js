var io = require('socket.io').listen(8888);
var playerList = new Array();
var currentWord;

function generateList()
{
	var tab = new Array();
	var i = 0;
	while (playerList[i] != undefined)
	{
		if (playerList[i]['out'] !== true && playerList[i]['login'] != undefined)
			tab.push(generatePlayer(playerList[i]));
		i++;
	}
	return tab;
}

function generatePlayerList(isPublic) {
	var tab = new Array();
	var i = 0;
	while(playerList[i] != undefined) {
		tab.push(generatePlayer(player[i], isPublic));
		i++;
	}
	return tab;
}

function generatePlayer(data, isPublic)
{
	var tab = {};
	tab.id = data['id'];
	tab.login = data['login'];
	tab.admin = data['admin'];
	tab.score = data['score'];
	tab.image = data['image'];

	if(isPublic === true) {
		tab.word = data['publicWord'];// _ X _ X _ X
		tab.used = data['used'].length;
	}
	else {
		tab.word = data['word'];// _ A _ B _ U
		tab.used = data['falseKey'];
	}
	return tab;
}

function refreshPlayer(id)
{
	io.emit("status", generatePlayer(playerList[id]));
}

function setWord(newWord)
{
	var i = 0;
	while (playerList[i] != undefined)
	{
		playerList[i].word = newWord;
		playerList[i].publicWord = newWord;
		i++;
	}
}

io.on('connection', function(socket)
{
	console.log("new");

	var player = {};
	player.socket = socket;
	player.score = 0;
	player.admin = false;
	player.used = [];
	player.falseKey = [];
	player.image = 11;
	player.id = socket.id;

	socket.on('login', function (login, id)
	{
		player.login = login;
		if (playerList.length == 0)
		{
			player.admin = true;
			socket.emit('admin');
		}
		playerList.push(player);
		socket.emit("login", player.login, player.id);
		/*
			
		*/
		io.emit("playerList", generateList());
	
		socket.on('word', function(word)
		{
			if (player.admin == true)
			{
				currentWord = word;
				var letters = word.length;
				var secretWord = "";
				var i = 0;
				while (i < letters)
				{
					secretWord += "_";
					i++;
				}
				setWord(secretWord);
				io.emit("start", secretWord);
				socket.to('roomadmin').emit("adminView", generatePlayerList(false));
				socket.join('roomadmin');
			}
			else {
				socket.join('roomplayer');
			}
		});
		socket.on('key', function(key)
		{
			player.used.push(key);
			var curPos = 0;
			var pos = 0;
			var wrong = true;
			while ((pos = currentWord.toLowerCase().indexOf(key.toLowerCase(), curPos)) != -1)
			{
				console.log("BEFORE > ", player.word, curPos, pos);
				player.word = player.word.substr(0, pos)+key+player.word.substr(pos+1);
				player.publicWord = player.publicWord.substr(0, pos)+'X'+player.publicWord.substr(pos+1);
				wrong = false;
				curPos = pos + 1;
				console.log("AFTER > ", player.word);
				console.log(key);
				console.log(curPos);
				console.log("DEBUG > ", currentWord.charAt(curPos));
				console.log(currentWord);
				if (player.word.toLowerCase() === currentWord.toLowerCase()) {
					io.emit("winner", generatePlayer(player, true));
				}
			}
			if (wrong) {
				player.falseKey.push(key);
				player.image--;
				if(player.image <= 0) {
					io.emit("loose", player.id);
				}
			}
			socket.emit('updatePlayer', generatePlayer(player, true));
			io.broadcast('roomplayer').emit('publicView', generatePlayerList(true));
			socket.to('roomadmin').emit("adminView", generatePlayerList(false));
		});
	});
	socket.on('disconnect', function()
	{
		player.out = true;
		console.log('disconnect event');
		io.emit("playerList", generateList());
	});
});

