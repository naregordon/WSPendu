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

function generatePlayer(data)
{
	var tab = {};
	tab.login = data['login'];
	tab.score = data['score'];
	tab.admin = data['admin'];
	tab.word = data['word'];// _ A _ B _ U
	tab.publicWord = "";// _ X _ X _ X
	tab.used = data['used'];
	tab.publicUsed = data['used'].length;
	tab.image = data['image'];
	tab.falseKey = data['falseKey'];
	tab.currentWord = data['currentWord'];
	return tab;
}

function refreshPlayer(id)
{
	io.emit("status", generatePlayer(playerList[id]));
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

	socket.on('login', function(login)
	{
		player.login = login;
		if (playerList.length == 0)
		{
			player.admin = true;
			socket.emit('admin');
		}
		playerList.push(player);

		socket.emit("login", login);
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
				player.word = secretWord;
				io.emit("start", secretWord);
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
				wrong = false;
				curPos = pos + 1;
				console.log("AFTER > ", player.word);
				console.log(key);
				console.log(curPos);
				console.log("DEBUG > ", currentWord.charAt(curPos));
			}
			if (wrong) {
				player.falseKey.push(key);
			}
			socket.emit('updatePlayer', generatePlayer(player));
		});
	});
	socket.on('disconnect', function()
	{
		player.out = true;
		console.log('disconnect event');
		io.emit("playerList", generateList());
	});
});

>>>>>>> 66b9404d93c494b67e76a3efb5156853677ed918
