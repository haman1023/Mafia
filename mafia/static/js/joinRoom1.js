// 소켓 연결
let socket = io();
const inputId=document.querySelector('#inputId');
const inputRole=document.querySelector('#inputRole');
const btnLogin = document.querySelector('#btnLogin');
// 연결되었을 때 신호 보내기
socket.on('connect', ()=>{
	btnLogin.addEventListener('click',()=>{
		const userName = inputId.value;
		const role = inputRole.value;
		loginForm.submit();
		// 서버로 방 참여 요청 보내기
		socket.emit('reqJoin', userName, role);
	});
	
});

// 똑같은 아이디면 경고 메시지 보내기
socket.on('alreadyID', (noName)=>{
	alert(`이미 존재하는 닉네임입니다.\n ${noName}으로 입장합니다.`)
});


// 일단 새로고침 막기
function noRefresh(){
	if(event.keyCode==116){
		
		event.keyCode=2;
		return false;
	}else if(event.ctrlKey && (event.keyCode==78 || event.keyCode==82)){
		return false;
	}
}
// 일단 막자
function movePage(){
	location.href='/main';
}