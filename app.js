var express = require('express'), routes = require('./routes'), user = require('./routes/user'), http = require('http'), path = require('path'), socket = require('socket.io');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' === app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('Mafia server listening on port ' + app.get('port'));
});
var io = socket.listen(server);

//	접속 유저 맵??
var usernames = [];
//	익명유저
var unknownUser = 0;
//	마피아 유저 맵??
var mafiaUserNames = [];
//	죽은 유저 맵??
var deadUserNames = [];


io.sockets.on('connection', function (socket) {
	socket.on('sendCitizenmsg', function (data) {
		io.sockets.in('citizen').emit('recvCitizenmsg', socket.username, data);
	});

	socket.on('sendSubmsg', function (data) {
		io.sockets.in(socket.room).emit('recvSubmsg', socket.username, data);
	});

  // 아이디 중복 확인
  var confirmID = function (user) {
		if(!user){
			var name = '익명' + unknownUser;
			usernames[name] = true;
			unknownUser += 1;
			return name;
		}else if(usernames[user]){
			socket.emit('existID');
			var name = '익명' + unknownUser;
			usernames[name] = true;
			unknownUser += 1;
			return name;
		}else{
			usernames[user] = true;
			return user;
		}
  };

	//	마피아 체크
	var mafiaCheck = function(user, grade){
		var roomname;
		if(grade=='2'){
			mafiaUserNames[user]=true;
			roomname = 'mafia';
		}else if(grade=='3'){
			deadUserNames[user]=true;
			roomname = 'deadman';
		}else{
			roomname = 'citizen';
		}
		return roomname;
	};

	socket.on('guestjoin', function(user, grade){
		var username = confirmID(user);
		var roomname = mafiaCheck(user, grade);

		//	모든 유저 접속(메인채팅방)
		socket.username = username;
		socket.room = roomname;
		usernames[username] = username;
		socket.join('citizen');
		socket.emit('mainnoti', 'green', 'you has connected Citizen-Chat');

		var userlist = new Array();
		var mafialist = new Array();
		var deadlist = new Array();

		for (var name in usernames) {
			userlist.push(usernames[name]);
		}

		//	마피아 일 경우
		if (roomname=='mafia'){
			mafiaUserNames[username] = username;
			socket.join(roomname);
			socket.emit('subnoti', 'red', 'you has connected Mafia-Community');

			for (var name in mafiaUserNames) {
				mafialist.push(mafiaUserNames[name]);
			}

			socket.broadcast.to(roomname).emit('subnoti', 'red', username + ' has connected to Community');
		}

		//	죽은사람 일 경우
		if (roomname=='deadman'){
			deadUserNames[username] = username;
			socket.join(roomname);
			socket.emit('subnoti', 'red', 'you has connected DeadChat');

			for (var name in deadUserNames) {
				deadlist.push(deadUserNames[name]);
			}

			socket.broadcast.to(roomname).emit('subnoti', 'red', username + ' has connected to Community');
		}

		//	유저리스트 뿌리기
		io.sockets.in(socket.room).emit('updateuser', userlist);

		//	접속 공지 뿌리기
		socket.broadcast.to('citizen').emit('mainnoti', 'green', username + ' has connected to Citizen');
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		var userlist = new Array();
		for (var name in usernames) {
			userlist.push(usernames[name]);
		}
		io.sockets.emit('updateuser', userlist);
		socket.broadcast.emit('servernoti', 'red', socket.username + ' has disconnected');
		socket.leave('citizen');
		socket.leave(socket.room);
	});
});
