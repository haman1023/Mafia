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
		}else{
			roomname = 'citizen';
		}
		return roomname;
	};

	socket.on('guestjoin', function(user, grade){
		var username = confirmID(user);
		var roomname = mafiaCheck(user, grade);

		console.log(username+"("+roomname+")"+"님이 접속하였습니다.");
		socket.emit('setUser', username, roomname);

		//	모든 유저 접속(메인채팅방)
		socket.username = username;
		socket.room = roomname;
		usernames[username] = username;
		socket.join('citizen');
		socket.emit('mainnoti', 'green', 'you has connected Citizen-Chat');

		var userlist = new Array();
		var mafialist = new Array();

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

		//	유저리스트 뿌리기
		io.sockets.in(socket.room).emit('updateuser', userlist);

		console.log("현재 접속 한 인원은 " + userlist.length + "명 입니다.");

		//	접속 공지 뿌리기
		socket.broadcast.to('citizen').emit('mainnoti', 'green', username + ' has connected to Citizen');
	});


	//	죽은사람 버튼 클릭
	socket.on('deadBtnClick', function () {
		var username = socket.username;
		deadUserNames[username] = true;
		deadUserNames[username] = username;

		if(socket.room == 'mafia'){
			socket.emit('subnoti', 'red', 'you are dead.');
			socket.emit('mainnoti', 'red', 'you are dead.');
			socket.broadcast.to(socket.room).emit('subnoti', 'red', username + ' is dead');
			socket.broadcast.to('citizen').emit('mainnoti', 'red', username + '(Mafia) is dead');
			socket.leave(socket.room);
		}else{
			socket.emit('subnoti', 'red', 'you are dead.');
			socket.emit('mainnoti', 'red', 'you are dead.');
			socket.broadcast.to('citizen').emit('mainnoti', 'green', username + '(Citizen) is dead');
		}

		var roomname = 'deadman';
		socket.room = roomname;
		socket.join(roomname);

		var userlist = new Array();
		var mafialist = new Array();
		var deadlist = new Array();

		// 산 사람
		for (var name in usernames) {
			userlist.push(usernames[name]);
		}
		//	마피아
		for (var name in mafiaUserNames) {
			mafialist.push(mafiaUserNames[name]);
		}
		//	죽은사람
		for (var name in deadUserNames) {
			deadlist.push(deadUserNames[name]);
		}

		var survivor = userlist.length - deadlist.length;
		console.log(survivor);

		socket.broadcast.to(roomname).emit('subnoti', 'red', username + ' is dead.');
		socket.broadcast.to('citizen').emit('mainnoti', 'blue', survivor + ' Citizens('+ mafialist.length + ' Mafias) is survive.');
	});

	socket.on('disconnect', function(){
		delete usernames[socket.username];
		console.log(socket.username+"("+socket.room+")"+"님이 접속을 해제하였습니다.");
		var userlist = new Array();
		for (var name in usernames) {
			userlist.push(usernames[name]);
		}
		io.sockets.emit('updateuser', userlist);

		console.log("남은 접속 인원은 " + userlist.length + "명 입니다.");

		socket.broadcast.emit('servernoti', 'red', socket.username + ' has disconnected');
		socket.leave('citizen');
		socket.leave(socket.room);
	});
});
