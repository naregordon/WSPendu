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
		setInterval(function()
		{
			socket.emit("login", login);
		}, 1000);
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
			if(currentWord.toLowerCase().indexOf(key.toLowerCase()) >= 0) {
				var posChar = currentWord.toLowerCase().indexOf(key.toLowerCase());
				var changCharC = currentWord.charAt(posChar);			
				var changCharW = player.word.charAt(posChar);
				player.word = player.word.replace(changCharW, changCharC);

				console.log('changCharW : '+changCharW);
				console.log('changCharC : '+changCharC);
				console.log("position de la lettre :"+posChar);
				console.log("Mot a trouver: "+currentWord);
				console.log("Lettre appuye: "+key);
				console.log("Mot en cours: "+player.word);
				console.log('la lettre existe');
			}
			else
				console.log('la lettre n\'existe pas');
		});
	});
	socket.on('disconnect', function()
	{
		player.out = true;
		console.log('disconnect event');
		io.emit("playerList", generateList());
	});
});

