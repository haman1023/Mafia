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

// app.get('/main', (req, res) => {
// 	fs.readFile('./static/main.html', (err, data) => {
// 		if (err) {
// 			res.send('에러');
// 		}else {
// 			res.writeHead(200, {'Content-Type':'text/html'})
// 			res.write(data);
// 			res.end();
// 		}
// 	});
// });

// 유저 목록들 설정하기 
// 모든 유저 목록
let userList = [];
// 익명 유저 숫자
let unknownUserCount = 0;
// 마피아 유저 목록
let mafiaUserList = [];
// 시체 유저 목록
let deadUserList = [];
// 접속자 수 
let onPlayer = 0;
// 닉네임 : 아이디 객체 생성
const idList = {};
// 투표 카운트
let voteCount = 0;

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
			let player = { userName: userName, role: role, conn: 1, vote: 0 };
			userList.push(player);
			roomName = 'citizen';
		// 2 마피아
		}else if(role=='2'){
			let player = { userName: userName, role: role, conn: 1, vote: 0 };
			userList.push(player);
			roomName = 'mafia';
		// 3 시체	
		}else if(role=='3'){
			let player = { userName: userName, role: role, conn: 1, vote: 0 };
			userList.push(player);
			roomName = 'tomb';
		// 현재는 나머지를 다 시민으로 설정해줄 것. 차후 업데이트 예정
		}else{
			let player = { userName: userName, role: '1', conn: 1, vote: 0 };
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
		
		// socket 찾을 수 있고, 출마하고.
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
		
		// 여기부분 코드가 약간 이상하고 중복이 많음. 고치자. 
		// 소켓이 속한 방 이름을 넣자. 
		socket.room=roomName;

		if(socket.room=='mafia'){
			mafiaUserList.push(socket.name);
			socket.join('mafia')
			io.to(socket.room).emit('subNotice', searchValue(socket.name, userList));

		}else if(socket.room=='tomb'){
			deadUserList.push(socket.name);
			socket.join('tomb')
			io.to(socket.room).emit('subNotice', searchValue(socket.name, userList));
			// 메인 채팅 보기만 할 수 있게 하는 신호 보내기
			socket.emit('cannotSend', socket.room);
		// 시민일 때는 서브채팅창을 막자. 
		}else {
			socket.emit('cannotSubSend', socket.room);
		}

		
		// 들어오는 사람마다 그림 영역 넣기 일단 이름이랑 역할 넣어놓자.
		// 클릭하면 밴되는 기능에 필요할 지 몰라. 
		io.sockets.emit('addIcon', userList);
		onPlayer++;

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
		// 총 투표해야하는 인원
		console.log("총 투표해야하는 사람 수"+(onPlayer-deadUserList.length))
		// 객체에 카운트 올리기 
		searchValue(data, userList).vote += 1;
		// console.log("득표"+searchValue(data, userList).vote);
		// 투표수도 추가
		voteCount +=1;
		// 당선자도 정의해놓자.
		let elected;
		console.log("투표인원 : "+voteCount)
		// 모두 투표했을 때!
		if(voteCount==(onPlayer-deadUserList.length)){
			console.log("개표 실행");
			// 최다 득표수부터 찾자. 
			const maxVote = Math.max.apply(Math, userList.map((o)=>{return o.vote}));
			
			console.log("최다 득표수 : "+maxVote);
			// 이제 최다 득표자 찾자. 
			for(let i=0;i<userList.length;i++){
				if(userList[i].vote==maxVote){
					elected = userList[i].userName;
				}
			}
			// 이제 그사람에게 방빼라고 전하자. 
			idList[elected].emit('moveRoom', searchValue(elected, userList));
			// 투표함 비우자. 
			for(let i=0;i<userList.length;i++){
				if(userList[i].vote!=0){
					userList[i].vote=0;
				}
			}
			// 투표인원도 초기화
			voteCount=0;
		}
		
	});
	// 어떤 소켓이 방 이동한다고(죽었다고 보냄)
	socket.on('changeRoom', (data)=>{
		console.log(data);
		console.log(socket.name);
		//자신의 역할이 mafia 였다면 그 방에서 나오게 해야 함.
		if(searchValue(socket.name, userList).role=="2"){
			//마피아 리스트에서도 삭제.
			mafiaUserList.splice(mafiaUserList.indexOf(socket.name),1);
			socket.leave('mafia');
			// 방 리셋
			socket.emit('resetChat','reset');
		}
		// 시체로 바꾸기
		// console.log(searchValue(socket.name, userList));
		searchValue(socket.name, userList).role="3";
		// console.log(searchValue(socket.name, userList));

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
		// 죽은 사람 빼고 모두에게 현 원 표시 
		socket.broadcast.emit('reportNow', {citizen: (onPlayer-mafiaUserList.length-deadUserList.length), mafia: mafiaUserList.length});
		// 메인 채팅 보기만 할 수 있게 하는 신호 보내기
		socket.emit('cannotSend', socket.room);
		// 서브채팅 다시 쓸 수 있게 신호 보내기 
		socket.emit('cannotSubSend', socket.room);
	});


	// 유저의 접속이 끊어졌을 때
	socket.on('disconnect', ()=>{
		// 유저리스트에서 접속 상태 변경
		console.log(`${socket.name} 님이 나가셨습니다.`);
		searchValue(socket.name, userList).conn = 0;
		console.log(userList);
		io.sockets.emit('mainNotice', searchValue(socket.name, userList));
		io.sockets.emit('userList', userList);
		io.sockets.emit('addIcon', userList);
		socket.leave('citizen');
		onPlayer--;
	});



});


/* 서버를 8080 포트로 listen */
server.listen(8080, () => {
	console.log('서버 실행 중');
})