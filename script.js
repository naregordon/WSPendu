var socket;
var login;

function managePlayerList(list)
{
	var i = 0;
	$(".other").empty();
	while(list[i] != undefined)
	{
		$(".other").append("<h2>"+list[i]['login']+"</h2>");
		i++;
	}
}

function chooseWord()
{
	var word = "";
	while (word.length < 4)
		word = prompt("Choose your destiny !\n...\nAnd a word to find.");
	socket.emit("word", word);
}

function sendKey(info)
{
	if (info.keyCode > 64 && info.keyCode < 90)
		socket.emit("", String.fromCharCode(info.keyCode));
}

$(document).ready(function()
{
	socket = io('192.168.1.93:8888');
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);

	socket.on("playerList", managePlayerList);
	socket.on("firstPlayer", chooseWord);

	$('body').on('keydown', sendKey);
});

