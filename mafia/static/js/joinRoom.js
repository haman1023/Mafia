// 소켓 연결
let socket = io();

// 연결되었을 때 신호 보내기
socket.on('connect', ()=>{
	// 유저 닉네임 설정
	const userName = prompt("닉네임을 입력해주세요.");
	const role = prompt("유저 역할을 정해주세요", "1: 시민, 2: 마피아");
	// 서버로 방 참여 요청 보내기
	socket.emit('reqJoin', userName, role);
})

// 똑같은 아이디면 경고 메시지 보내기
socket.on('alreadyID', (noName)=>{
	alert(`이미 존재하는 닉네임입니다.\n ${noName}으로 입장합니다.`)
})
socket.on('setName', (data)=>{
	socket.name=data;
});
