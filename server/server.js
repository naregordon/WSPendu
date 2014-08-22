var io = require('socket.io').listen(8888);

io.on('connection', function(socket)
{
	console.log("new");
	socket.on('message', function(msg, author)
	{
		io.emit('message', msg, author);
	});
});