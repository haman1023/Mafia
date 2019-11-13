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

// 닉네임 : 아이디 객체 생성
const idList = {};

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
		// console.log(searchValue(userName, userList));
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
		socket.name=userNameChecked;
		// console.log(userNameChecked);
		console.log(socket.name);
		// 역할군 및 리스트에 넣어주기
		const roomName = roleSelect(socket.name, role);
		
		// console.log(userList);
		// console.log(roomName);
		// console.log(socket.room);
		// 이놈이 문제네.
		// socket.id = userNameChecked;
		// socket.name을 키값으로, socket.id를 value값으로 들고 있는 걸 하나 만들자
		
		idList[socket.name]=socket;
		
		//확인
		// console.log(idList);
		// citizen 채팅방(메인)
		// 일단은 귀신도 다 들어가게 해놓자.
		socket.join('citizen');
		console.log(`${socket.name} 님이 접속하셨습니다.`);
		// socket에도 정해진 네임 전달
		socket.emit('setName', socket.name);
		// console.log(searchValue(userNameChecked, userList));
		io.sockets.emit('mainNotice', searchValue(socket.name, userList));
		io.sockets.emit('userList', userList);
		

		// 마피아일 경우
		if(roomName =='mafia'){
			// console.log("마피아 집어넣기");
			mafiaUserList.push(socket.name);
			socket.join(roomName);
			socket.room=roomName;
			io.to(roomName).emit('subNotice', searchValue(socket.name, userList));
		}

		// 시체가 될 경우
		if(roomName =='tomb'){
			// console.log("시체 집어넣기");
			deadUserList.push(socket.name);
			socket.join(roomName);
			socket.room=roomName;
			io.to(roomName).emit('subNotice', searchValue(socket.name, userList));
		}
		// 쟤네 둘 아니면 그냥 citizen 을 넣자. 
		socket.room=roomName;
		// 들어오는 사람마다 그림 영역 넣기 일단 이름이랑 역할 넣어놓자.
		// 클릭하면 밴되는 기능에 필요할 지 몰라. 
		io.sockets.emit('addIcon', userList);

	});

	//메시지 관련 처리
	socket.on('sendMsg',(data)=>{
		console.log(data);
		// 메인 메시지 일 경우 자기 빼고 다 전달
		if(data.type=='mainMsg'){
			console.log(data.message);
			socket.broadcast.emit('mainMsg', {name: socket.name, message: data.message});
		}
		// 서브 메시지일 경우 그 그룹에서 자기 빼고 다 전달 / 시민 빼고
		if(data.type=='subMsg' && socket.room!='citizen'){
			console.log(data.message);
			socket.broadcast.to(socket.room).emit('subMsg', {name: socket.name, message: data.message});
		}

	});

	// kill 요청 받았을 때
	socket.on('killUser', (data)=>{
		// 그 사람을 찾아서 
		console.log(searchValue(data, userList));
		// 해당 소켓에 방 이동 하라고 보내기. 
		idList[data].emit('moveRoom', searchValue(data, userList))
		
	});
	// 어떤 소켓이 방 이동한다고(죽었다고 보냄)
	socket.on('changeRoom', (data)=>{
		console.log(data);
		console.log(socket.name);
		//자신의 역할이 mafia 였다면 그 방에서 나오게 해야 함.
		if(searchValue(socket.name, userList).role=="2"){
			socket.leave('mafia');
		}
		// 시체로 바꾸기
		console.log(searchValue(socket.name, userList));
		searchValue(socket.name, userList).role="3";
		console.log(searchValue(socket.name, userList));

		// 시체 유저 리스트에 추가
		deadUserList.push(socket.name);
		// 시체방에 조인
		socket.join('tomb');
		socket.room='tomb';
		// 각 방 공지
		io.sockets.emit('mainNotice', searchValue(data, userList));
		io.to('tomb').emit('subNotice', searchValue(data, userList));
		// 아이콘도 변경하자. 
		io.sockets.emit('addIcon', userList);
	});


	// 유저의 접속이 끊어졌을 때
	socket.on('disconnect', ()=>{
		// 유저리스트에서 접속 상태 변경
		console.log(`${socket.name} 님이 나가셨습니다.`);
		searchValue(socket.name, userList).conn = 0;
		console.log(userList);
		io.sockets.emit('mainNotice', searchValue(socket.name, userList));
		io.sockets.emit('userList', userList);
		socket.leave('citizen');
		//특정 역할일 경우 그 방에서 나가는 것도 구현하자.

	});



});


/* 서버를 8080 포트로 listen */
server.listen(8080, () => {
	console.log('서버 실행 중');
})