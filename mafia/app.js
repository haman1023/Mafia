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

// 유저 목록들 설정하기 
// 모든 유저 목록
let userList = [];
// 익명 유저 숫자
let unknownUserCount = 0;
// 마피아 유저 목록
let mafiaUserList = [];
// 시체 유저 목록
let deadUserList = [];

// 닉네임으로 그 값을 가지고 있는 배열 안에 있는 객체를 찾는 함수
function searchValue(nameValue, anyArray){
	for(let i=0; i<anyArray.length; i++){
		if(anyArray[i].userName === nameValue){
			return anyArray[i]
		}
	}
	return null;
};

// serverSocket에 연결되었을 때
io.sockets.on('connection', (socket)=>{
	// 익명 부여 함수
	function anonym(userName){
		// 닉네임을 입력해주지 않았을 때
		if(!userName){
			const noName = '익명'+unknownUserCount;
			unknownUserCount++;
			return noName;
		// 닉네임을 넣어주었을 때
		}else {
			return userName;
		}
	};

	// 아이디 중복 체크 함수
	function confirmID(userName) {
		// 닉네임이 중복될 경우
		console.log(searchValue(userName, userList));
		if(searchValue(userName, userList)!=null){
			const noName = '익명'+unknownUserCount;
			unknownUserCount++;
			socket.emit('alreadyID', noName);
			return noName;
		// 중복이 없을 경우
		}else {
			return userName;
		}
	};

	// 역할 정하는 함수
	function roleSelect(userName, role){
		// 기본 1 시민 
		if(role=='1'){
			let player = { userName: userName, role: role, conn: 1 };
			userList.push(player);
			roomName = 'citizen';
		// 2 마피아
		}else if(role=='2'){
			let player = { userName: userName, role: role, conn: 1 };
			userList.push(player);
			roomName = 'mafia';
		// 3 시체	
		}else if(role=='3'){
			let player = { userName: userName, role: role, conn: 1 };
			userList.push(player);
			roomName = 'tomb';
		// 현재는 나머지를 다 시민으로 설정해줄 것. 차후 업데이트 예정
		}else{
			let player = { userName: userName, role: '1', conn: 1 };
			userList.push(player);
			roomName = 'citizen';
		}
		return roomName;
	};

	// 접속 체크
	socket.on('reqJoin', (userName, role)=>{
		// 익명 여부 확인
		const loadedUserName = anonym(userName);
		// 아이디 중복 체크
		// console.log(loadedUserName);
		const userNameChecked = confirmID(loadedUserName);
		socket.name=userNameChecked
		// console.log(userNameChecked);
		// 역할군 및 리스트에 넣어주기
		const roomName = roleSelect(userNameChecked, role);
		socket.room=roomName;
		console.log(userList);
		console.log(roomName);
		

		// 각 방의 접속자 리스트
		// const onUserList = [];
		// const onMafiaUserList = [];
		// const onDeadUserList = [];

		// citizen 채팅방(메인)
		// 일단은 귀신도 다 들어가게 해놓자.
		socket.join('citizen');
		console.log(`${userNameChecked} has connected citizen room`);
		// console.log(searchValue(userNameChecked, userList));
		io.sockets.emit('mainNotice', searchValue(userNameChecked, userList));
		socket.userName = userNameChecked;
		io.sockets.emit('userList', userList);

		// 마피아일 경우
		if(roomName =='mafia'){
			mafiaUserList.push(userNameChecked);
			socket.join(roomName);
			io.to(roomName).emit('subNotice', searchValue(userNameChecked, userList));
		}

		// 시체가 될 경우
		if(roomName =='tomb'){
			deadUserList.push(userNameChecked);
			socket.join(roomName);
			io.to(roomName).emit('subNotice', searchValue(userNameChecked, userList));
		}

	});

	//메시지 관련 처리
	socket.on('sendMsg',(data)=>{
		console.log(data);
		// 메인 메시지 일 경우 자기 빼고 다 전달
		if(data.type=='mainMsg'){
			console.log(data.message);
			socket.broadcast.emit('mainMsg', {name: socket.name, message: data.message});
		}

	});



	// 유저의 접속이 끊어졌을 때
	socket.on('disconnect', ()=>{
		// 유저리스트에서 접속 상태 변경
		console.log(`${socket.userName} 님이 나가셨습니다.`);
		searchValue(socket.userName, userList).conn = 0;
		console.log(userList);
		io.sockets.emit('mainNotice', searchValue(socket.userName, userList));
		io.sockets.emit('userList', userList);
		socket.leave('citizen');
		//특정 역할일 경우 그 방에서 나가는 것도 구현하자.

	});



});


/* 서버를 8080 포트로 listen */
server.listen(8080, () => {
	console.log('서버 실행 중');
})