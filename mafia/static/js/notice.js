// 메인 채팅 창 공지사항 뿌리기
socket.on('mainNotice', (data)=>{
	console.log(data);
	// 관련 변수 설정
	const mainChat = document.querySelector('.main_chat');
	const chatLine = document.createElement('div');
	let className = "";
	let node;
	// 받은 객체의 Conn상태에 따라 메시지 바꾸기
	switch (data.conn) {
		// 접속함
		case 1:
			// 유령 아닐 때만
			if(data.role!='3'){
				className = 'login';
				node = document.createTextNode(`${data.userName} 님이 접속했습니다.`);
				// 공지 형성
				chatLine.classList.add(className);
				chatLine.appendChild(node);
				mainChat.appendChild(chatLine);
			}
			break;
		// 접속 끊김
		case 0:
			className = 'logout'
			node = document.createTextNode(`${data.userName} 님이 나가셨습니다.`);
			// 공지 형성
			chatLine.classList.add(className);
			chatLine.appendChild(node);
			mainChat.appendChild(chatLine);
			break;
	}
	// 접속 중일 때만
	if(data.conn==1){
		// role 이 시체가 되었을 때도 표시하기 
		switch (data.role) {
			// 시체되었을 때
			case '3':
				className = 'logout'
				node = document.createTextNode(`${data.userName} 님이 사망하셨습니다.`);
				const deadChatLine = document.createElement('div');
				// 공지 형성
				deadChatLine.classList.add(className);
				deadChatLine.appendChild(node);
				mainChat.appendChild(deadChatLine);
				break;
		}
	}
	
});
// 서브 채팅 방 공지 올리기
socket.on('subNotice', (data)=>{
	console.log(data);
	const subChat = document.querySelector('.sub_chat');
	const chatLine = document.createElement('div');
	let className = "login";
	let node;
	console.log(data.role);
	// 받은 객체의 role상태에 따라 메시지 바꾸기
	switch (data.role) {
		// 마피아일 때
		case '2':
			node = document.createTextNode(`${data.userName} 님은 마피아입니다.`);
			break;
		// 시체일 때
		case '3':
			node = document.createTextNode(`${data.userName} 님은 유령이 되었습니다.`);
			break;
	}
	// 공지 형성
	chatLine.classList.add(className);
	chatLine.appendChild(node);
	subChat.appendChild(chatLine);
});

socket.on('reportNow', (data)=>{
	const citizenNum = data.citizen;
	const mafiaNum = data.mafia;
	alert(`현재 시민은 ${citizenNum}명, 마피아는 ${mafiaNum}명 남았습니다.`)
})
	
// 스크롤 밑으로 
function gotoBottom(cls){
	const element = document.querySelector("."+cls);
	element.scrollTop = element.scrollHeight-element.clientHeight;
}


