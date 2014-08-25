var socket;
var list;
var login;
var id;

function manageSelfLogin(realLogin, realId)
{
	login = realLogin;
	realId = id;
	alert("Bonjour "+login+" !");
	socket.removeListener('login', manageSelfLogin);
}

function displayRoom()
{
	$('.block,#start').hide();
	$('#room').show();
	socket.on("admin", displayStartButton);
	socket.on("start", displayGame);
}

function displayStartButton()
{
	$('#start').show();
	$('#start').one('click', function()
	{
		var word = "";
		while (word.length < 4)
			word = prompt("Choose your destiny !\n...\nAnd a word to find.");
		socket.emit("word", word);
	});
	socket.removeListener('admin', displayStartButton);
}

function update(info)
{
	if (info.id != id)
		var block = $("#other").find('j_'+info.id);
	else
		var block = $("#self");
	$('.img', block).attr('src', "images/pendu.jpg");// info.img
	$('.word', block).html("_ _ X _");// info.word
	$('.used', block).html("3");// info.used
}

function displayGame(word)
{
	$('.block').hide();
	$('#game').show();
	$('#self').find('.word').html(word);
	$('#self').find('.used').empty();
	$('#self').find('.img').attr('src', "images/pendu.jpg");
	$('body').off('keydown').on('keydown', sendKey);
	// Récupérer les informations de tout le monde !
	socket.on("update", update);
	socket.removeListener('start', displayGame);
}

function displayGameAdmin()
{
	$('').hide();
	$('').show();
}

function displayFinish()
{
	$('body').off('keydown');
	$('.block').hide();
	$('#finish').show();
}

function managePlayerList(playerList)
{
	list = playerList;
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

function sendKey(info)
{
	if (info.keyCode > 64 && info.keyCode < 91)
		socket.emit("key", String.fromCharCode(info.keyCode));
}

$(document).ready(function()
{
	socket = io('localhost:8888');
	//socket = io('192.168.1.93:8888');
	displayRoom();
	socket.on("playerList", managePlayerList);
	socket.on("login", manageSelfLogin);
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);
});

