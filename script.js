var socket;
var list;
var login;
var id;

function manageSelfLogin(realLogin, realId)
{
	login = realLogin;
	id = realId;
	alert("Bonjour "+login+" ! ("+id+")");
	socket.removeListener('login', manageSelfLogin);
}

function displayRoom()
{
	$('.block,#start').hide();
	$('#room').show();
	socket.on("admin", displayStartButton);
	socket.on("start", displayGame);
	socket.removeListener('reset', displayRoom);
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
		$('.img', $('#j_'+info.id)).attr('class', "imgstatus"+(12 - info.image)).addClass('img');
		$('.word', $('#j_'+info.id)).html(info.word);
		$('.used', $('#j_'+info.id)).html(info.used);
	}
	else
	{
		var div = $('<fieldset id="j_'+info.id+'"><legend>'+info.login+'</legend></fieldset>');
		$(div).append('<div class="img imgstatus'+(12 - info.image)+'"></div>');
		$(div).append('<div class="word">'+info.word+'</div>');
		$(div).append('<div class="used">'+info.used+'</div>');
		if (info.id == id)
			$('#self').html(div);
		else
			$('#other').append(div);
	}
}

function updateTimer(timer)
{
	$('#clock').html(timer);
}

function displayGame(word, playerList, timer)
{
	$('#clock').html(timer);
	managePlayerList(playerList);
	$('.block').hide();
	$('#game').show();
	$('#self').find('.word').html(word);
	$('#self').find('.used').empty();
	$('#self').find('.img').attr('class', "imgstatus11").addClass('img');
	$('body').off('keydown').on('keydown', sendKey);
	var i = 0;
	while (list[i] != undefined)
	{
		update(list[i]);
		i++;
	}
	socket.on("updatePlayer", update);
	socket.on("timer", updateTimer);
	socket.removeListener('start', displayGame);
	socket.removeListener('admin', displayStartButton);
	socket.on("loose", displayFinish);
	socket.on("winner", displayFinish);
}

function displayFinish(data)
{
	if (typeof data == "object")
	{
		socket.removeListener('updatePlayer', update);
		socket.removeListener('loose', displayFinish);
		socket.removeListener('winner', displayFinish);
		socket.removeListener('timer', updateTimer);
		$('body').off('keydown');
		$('.block').hide();
		$('#finish').show();
		$('#winner').html(data.login+' ('+data.score+')');
		socket.on("reset", displayRoom);
	}
	else
		$('#j_'+data).css('background-color', 'red');
}

function managePlayerList(playerList)
{
	list = playerList;
	var i = 0;
	$("#list").empty();
	while(list[i] != undefined)
	{
		if (list[i].admin == true)
			$("#list").append('<h2 style="background-color:red;">'+list[i]['login']+" ("+list[i].score+")</h2>");
		else
			$("#list").append("<h2>"+list[i]['login']+"("+list[i].score+")</h2>");
		i++;
	}
}

function managePlayers(tab)
{
	list = tab;
	var i = 0;
	$("#list").empty();
	while(list[i] != undefined)
	{
		if (list[i].admin == true)
			$("#list").append('<h2 style="background-color:red;">'+list[i]['login']+" ("+list[i].score+")</h2>");
		else
			$("#list").append("<h2>"+list[i]['login']+"("+list[i].score+")</h2>");
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
	socket.on("updatePlayers", managePlayers);
	socket.on("login", manageSelfLogin);
	login = prompt('What is your nickname ? :)');
	socket.emit("login", login);
});
