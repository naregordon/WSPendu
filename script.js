const INIT = 1;

var socket;
var login;
var status;

function manageSelfLogin(truelogin)
{
	login = truelogin;
	$('#self').html("Bonjour "+login);
}

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
	$('#button').show();
	$('#button').on('click', function()
	{
		chooseWord();
	});
}

function displayGame(word)
{
	$('#word').html(word);
	$('body').off('keydown').on('keydown', sendKey);
	//$('').hide();
	//$('').show();
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
	$("#list").empty();
	while(list[i] != undefined)
	{
		if (list[i].admin == true)
			$("#list").append('<h2 style="background-color:red;">'+list[i]['login']+"</h2>");
		else
			$("#list").append("<h2>"+list[i]['login']+"</h2>");
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
	if (info.keyCode > 64 && info.keyCode < 91)
		socket.emit("key", String.fromCharCode(info.keyCode));
}

$(document).ready(function()
{
	socket = io('localhost:8888');
	displayRoom();
	//socket = io('192.168.1.93:8888');
	socket = io('localhost:8888');
	socket.on("playerList", managePlayerList);
	socket.on("login", manageSelfLogin);
	socket.on("admin", displayStartButton);
	socket.on("start", displayGame);
	socket.on('updatePlayer', function(data){
		displayGame(data['word']);
		console.log(data)});
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);


});

