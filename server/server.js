var io = require('socket.io').listen(8888);

io.on('connection', function(socket)
{
	console.log("new");

	socket.on('login', function(login)
	{
		console.log("bonjour "+login);
		io.emit("new_user", login);
	});
});
