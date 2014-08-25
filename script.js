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
	console.log(info);
	if ($('#j_'+info.id).length > 0)
	{
		$('.img', $('#j_'+info.id)).attr('src', 'images/pendu.jpg');
		$('.word', $('#j_'+info.id)).html(info.word);
		$('.used', $('#j_'+info.id)).html(info.used);
	}
	else
	{
		var div = $('<fieldset id="j_'+info.id+'"><legend>'+info.login+'</legend></fieldset>');
		$(div).append('<img class="img" src="images/pendu.jpg"/>');
		$(div).append('<div class="word">'+info.word+'</div>');
		$(div).append('<div class="used">'+info.used+'</div>');
		if (info.id == id)
			$('#self').html(div);
		else
			$('#other').append(div);
	}
}

function displayGame(word)
{
	$('.block').hide();
	$('#game').show();
	$('#self').find('.word').html(word);
	$('#self').find('.used').empty();
	$('#self').find('.img').attr('src', "images/pendu.jpg");
	$('body').off('keydown').on('keydown', sendKey);
	var i = 0;
	while (list[i] != undefined)
	{
		update(list[i]);
		i++;
	}
	socket.on("updatePlayer", update);
	socket.removeListener('start', displayGame);
	socket.removeListener('admin', displayStartButton);
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
	socket.on("loose", function(id){alert('loose'+id)});
	socket.on("winner", function(id){alert('win'+id.login)});
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);
});
