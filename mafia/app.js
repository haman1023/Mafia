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
		// console.log(userNameChecked);
		// 역할군 및 리스트에 넣어주기
		const roomName = roleSelect(userNameChecked, role);
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

	//



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

	// 


});



// // serverSocket에 연결되었을 때
// io.sockets.on('connection', (socket)=>{
	
// 	

// 	

// 	// 접속 체크 
// 	socket.on('reqJoin', (userName, role)=>{
// 		// 아이디 중복 체크 및 들어갈 방 이름 정해주기
// 		const userNameChecked = confirmID(userName);
// 		console.log(userNameChecked);
// 		const roomName = roleCheck(userName, role);
// 		console.log(roomName);
		
// 		// 메인 채팅 방 (모든 유저들 대상)
// 		socket.userName = userNameChecked;
// 		socket.room = roomName;
// 		userList[userNameChecked] = userNameChecked;
// 		socket.join('citizen');
// 		// 1은 연결되었을 때를 뜻함. 
// 		socket.emit('mainNotice', 1, 'you has connected Citizen-Chat');

// 		// 각 채팅방 접속자 목록
// 		let onUserList = new Array();
// 		let onMafiaUserList = new Array();
// 		let onDeadUserList = new Array();
		
// 		// userList의 유저들을 전부 접속한 유저 목록에 집어넣기
// 		for(let user in userList){
// 			onUserList.push(userList[user]);
// 		}

// 		// 다른 역할들 중 마피아
// 		if(roomName=='mafia'){
// 			mafiaUserList[userNameChecked] = userNameChecked;
// 			socket.join(roomName);
// 			// 자기 자신에게 알려줌
// 			socket.emit('subNotice', 1, 'you has connected Mafia-Community');
// 			// 마피아 접속 유저들 전부 마피아 접속자 목록에 집어넣기
// 			for(let user in mafiaUserList){
// 				onMafiaUserList.push(mafiaUserList[user]);
// 			}
// 			// 그사람 제외하고 모든 사람들에게 공지
// 			socket.broadcast.to(roomName).emit('subNotice', 1, userNameChecked + ' has connected to Community');
// 		}

// 		// 시체들일 경우
// 		if(roomName=='tomb'){
// 			deadUserList[userNameChecked] = userNameChecked;
// 			socket.join(roomName);
// 			// 자기 자신에게 알려줌
// 			socket.emit('subNotice', 'red', 'you has connected tomb');
// 			// 현재 시체 목록에 집어넣기
// 			for(let user in deadUserList){
// 				onDeadUserList.push(deadUserList[user]);
// 			}
// 			// 그 사람을 제외하고 다른 사람에게 공지
// 			socket.broadcast.to(roomName).emit('subNotice', 1, userNameChecked + ' has connected to Community');
// 		}

// 		// 새로 들어왔을 유저에게 유저 리스트 뿌리기
// 		io.sockets.in(socket.room).emit('updateUser', onUserList);

// 		// 그 사람을 제외하고 접속했다는 공지 뿌리기 1
// 		socket.broadcast.to('citizen').emit('mainNotice', 1, userNameChecked + ' has connected to Citizen');

		
// 	});

// 	// 유저의 접속이 끊어졌을 때
// 	socket.on('disconnect', ()=>{
// 		// 접속자 목록에서 삭제
		
// 		const idx = userList.indexOf(socket.userName)
// 		if(idx > -1) userList.splice(idx,1);
// 		// 새 유저 목록 작성해서 남은 사람들 넣기
// 		const upUserList = new Array();
// 		for(let name in userList){
// 			upUserList.push(userList[name]);
// 		}
// 		// 변경된 유저 리스트 뿌리기
// 		io.sockets.emit('updateUserList', upUserList);
// 		// 나머지 사람에게 알려주기 0은 연결 종료
// 		socket.broadcast.emit('mainNotice', 0, `${socket.userName} has disconnected`);
// 		// 시민이 아닌 경우에만 각 그룹에 날려주기하면 될듯?
// 		if()
// 		socket.broadcast.to(socket.room).emit('subNotice', 0, `${socket.userName} has disconnected`);
// 		// 방에서 나가기
// 		socket.leave('citizen');
// 		socket.leave(socket.room);

// 	})
	
// });


/* 서버를 8080 포트로 listen */
server.listen(8080, () => {
	console.log('서버 실행 중');
})