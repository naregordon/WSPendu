const INIT = 1;

var socket;
var login;
var status;

function displayRoom()
{
	if (status === undefined)
	{
		status = INIT;
		$('').hide();
		$('').show();
		$('').hide();// hide startbutton
	}
}

function displayStartButton()
{
	$('').show();
}

function displayGame(word)
{
	alert(word);
	$('').hide();
	$('').show();
}

function displayGameAdmin()
{
	$('').hide();
	$('').show();
}

function displayFinish()
{
	$('').hide();
	$('').show();
}

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
	displayRoom();
	//socket = io('192.168.1.93:8888');
	socket = io('localhost:8888');
	socket.on("playerList", managePlayerList);
	socket.on("firstPlayer", displayStartButton);
	socket.on("secretWord", displayGame);
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);


	$('body').on('keydown', sendKey);
});

