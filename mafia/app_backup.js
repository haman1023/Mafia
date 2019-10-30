/* 설치한 express 모듈 불러오기 */
const express = require('express');

/* socket.io 불러오기*/
const socket = require('socket.io');

/* http 모듈(내장) */
const http = require('http');

/* fs (내장) */
const fs = require('fs');

/* express 객체 */
const app = express();

/* express http 서버 생성 */
const server = http.createServer(app);

/* 생성된 서버를 socket.io에 바인딩 */
const io = socket(server);

/* 기타 사용될 변수 설정 */
let userList = new Array();

/* 채팅 룸 배열 (안의 것들은 객체) 설정 */
let chattingRoom = [
	{_id: 'mainChatRoom', members:[]},
	{_id: 'subChatRoom', members:[]}
];




/* static 안의 정적 파일 제공 */
app.use(express.static('static'))

/* Get 방식으로 / 경로에 접속하면 실행 됨 */
app.get('/', (req, res) => {
	fs.readFile('./static/index.html', (err, data) => {
		if (err) {
			res.send('에러');
		}else {
			res.writeHead(200, {'Content-Type':'text/html'})
			res.write(data);
			res.end();
		}
	});
});

/*
	- socket.io 이벤트 명 정리 -
	connection	웹 소켓 연결
	newUser			새로운 유저 접속을 서버에게 알림
	initUserList 유저 목록을 초기화하기
	update			서버로부터 받은 메시지를 클라이언트에게 전송(접속 종료 부분도 포함 중)
	message			클라이언트가 서버로 메시지 전송
	disconnect	연결돈 소켓과 접속이 끊어짐
	joinRoom		서브채팅방 접속
	
*/


io.on('connection', (socket) => {
	/* 새로운 유저가 접속했을 때 다른 소켓들에게도 알림 */
	socket.on('newUser', (name) => {
		console.log(`${name} 님이 접속하였습니다.`);
		/* 소켓에 이름 저장*/
		socket.name = name;
		userList.push(name);
		console.log(userList);
		/*모든 소켓에 전송*/
		io.sockets.emit('initUserList', {list:userList});
		io.sockets.emit('update', {type: 'connect', name: 'SERVER', message: `${name} 님이 접속하였습니다.`});

		/* 서브 채팅방에 넣기 */
		socket.join(chattingRoom[1]._id, () => {
			console.log(name+' join a '+chattingRoom[1]._id);
			io.to(chattingRoom[1]._id).emit('joinRoom', name);
		});

	})

	/* 전송한 메시지 받기 */
	socket.on('message', (data) => {
		/* 받은 데이터에 누가 보냈는지 이름 추가 */
		data.name = socket.name;

		console.log(data);

		/* 보낸 사람을 제외한 나머지 유저에게 메시지 전송 */
		socket.broadcast.emit('update', data);
	})

	

	socket.on('subMessage', (data) => {
		
		data.name = socket.name;
		
		console.log(data);

		socket.broadcast.to(chattingRoom[1]._id).emit('subOtherMessage', data);
	})
	/* 접속 종료 */
	socket.on('disconnect', ()=>{
		console.log(`${socket.name} 님이 나가셨습니다.`)
		/* 나가는 사람을 제외한 나머지 유저에게 메시지 전송 */
		socket.broadcast.emit('update', {type: 'disconnect', name: 'SERVER', message: `${socket.name} 님이 나가셨습니다.`});
		socket.broadcast.to(chattingRoom[1]._id).emit('leaveSubRoom', {type: 'logout', name: socket.name, subOutMessage: `님이 나가셨습니다.`});
		socket.leave(chattingRoom[1]._id);
		console.log(userList);
		userList.splice(userList.indexOf(socket.name),1);
		io.sockets.emit('initUserList', {list:userList});
	})

});
/* 서버를 8080 포트로 listen */
server.listen(8080, () => {
	console.log('서버 실행 중');
})