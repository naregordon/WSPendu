var io = require('socket.io').listen(8888);
var playerList = new Array();
var currentWord;
var interv;

function generateList()
{
	var tab = new Array();
	var i = 0;
	while (playerList[i] != undefined)
	{
		if (playerList[i]['online'] === true && playerList[i]['login'] != undefined)
			tab.push(generatePlayer(playerList[i], true));
		i++;
	}
	return tab;
}

function generatePlayerList(isPublic) {
	var tab = new Array();
	var i = 0;
	while(playerList[i] != undefined) {
		tab.push(generatePlayer(playerList[i], isPublic));
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

function createPlayer(socket)
{
	var player = {};
	player.socket = socket;
	player.score = 0;
	player.admin = false;
	player.used = new Array();
	player.falseKey = [];
	player.image = 1;
	player.id = socket.id;
	player.online = false;
	return player;
}

io.on('connection', function(socket)
{
	var player = createPlayer(socket);
	console.log("New player > ", player.id);

	socket.on('login', function (login, id)
	{
		player.login = login;
		player.online = true;
		playerList.push(player);
		var l = 0;
		var bool = false;
		while (playerList[l] != undefined)
		{
			if (playerList[l].admin == true && playerList[l].online == true)
				bool = true;
			l++;
		}
		console.log("admin > ", bool);
		if (bool == false)
		{
			var m = 0;
			while (playerList[m] != undefined && playerList[m].online != true)
				m++;
			console.log(playerList[m].login);
			if (playerList[m] != undefined)
			{
				playerList[m].admin = true;
				playerList[m].socket.join('roomadmin');
				playerList[m].socket.leave('roomplayer');
				playerList[m].socket.emit('admin');
			}
		}
		else
			socket.join('roomplayer');
		socket.emit("login", player.login, player.id);

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
				var timer = 30;
				setWord(secretWord);
				io.emit("start", secretWord, generateList(), timer);
				socket.to('roomadmin').emit("updatePlayers", generatePlayerList(false));
				interv = setInterval(function()
				{
					io.emit('timer', timer);
					timer--;
					if (timer <= -1)
					{
						player.score += 2 * currentWord.length;
						io.emit('winner', generatePlayer(player, true));
						clearInterval(interv);
						setTimeout(function()
						{
							io.emit('reset');
							io.emit("updatePlayers", generatePlayerList(true));
							setTimeout(function()
							{
								socket.emit('admin');
							}, 1000);
						}, 5000);
					}
				}, 1000);
			}
		});
		if(player.admin != true)
		{
			socket.on('key', function(key)
			{
				if (player.used.indexOf(key) == -1)
				{
					player.used.push(key);
					var curPos = 0;
					var pos = 0;
					var wrong = true;
					while ((pos = currentWord.toLowerCase().indexOf(key.toLowerCase(), curPos)) != -1)
					{
						player.word = player.word.substr(0, pos)+key+player.word.substr(pos+1);
						player.publicWord = player.publicWord.substr(0, pos)+'X'+player.publicWord.substr(pos+1);
						wrong = false;
						curPos = pos + 1;
						player.score += 2;
						if (player.word.toLowerCase() === currentWord.toLowerCase())
						{
							player.score += 2 * currentWord.length;
							io.emit("winner", generatePlayer(player, true));
							setTimeout(function()
							{
								io.emit('reset');
								var k = 0;
								while (playerList[k] != undefined)
								{
									if (playerList[k].admin == true)
									{
										playerList[k].admin = false;
										playerList[k].socket.leave('roomadmin');
										playerList[k].socket.join('roomplayer');
									}
									k++;
								}
								player.admin = true;
								player.socket.leave('roomplayer');
								player.socket.join('roomadmin');
								setTimeout(function()
								{
									io.emit("updatePlayers", generatePlayerList(true));
									socket.emit('admin');
								}, 1000);
							}, 5000);
							clearInterval(interv);
						}
					}
					if (wrong) {
						player.falseKey.push(key);
						player.image++;
						player.score--;
						if(player.image == 11) {
							io.emit("loose", player.id);
						}
					}
					socket.emit('updatePlayer', generatePlayer(player, false));
					socket.broadcast.to('roomplayer').emit('updatePlayer', generatePlayer(player, true));
					io.to('roomadmin').emit("updatePlayer", generatePlayer(player, false));
				}
			});
		};
	});
	socket.on('disconnect', function()
	{
		player.online = false;
		console.log('Player disconnected > ', player.id);
		io.emit("playerList", generateList());
	});
});

