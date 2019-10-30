// 메인 채팅 창 공지사항 뿌리기
socket.on('mainNotice', (data)=>{
	console.log(data);
	socket.userName = data.userName;
	// 관련 변수 설정
	const mainChat = document.querySelector('.main_chat');
	const chatLine = document.createElement('div');
	let className = "";
	let node;
	// 받은 객체의 Conn상태에 따라 메시지 바꾸기
	switch (data.conn) {
		// 접속함
		case 1:
			className = 'login';
			node = document.createTextNode(`${data.userName} 님이 접속했습니다.`);
			break;
		// 접속 끊김
		case 0:
			className = 'logout'
			node = document.createTextNode(`${data.userName} 님이 나가셨습니다.`);
			break;
	}
	
	// 공지 형성
	chatLine.classList.add(className);
	chatLine.appendChild(node);
	mainChat.appendChild(chatLine);
});
// 서브 채팅 방 공지 올리기
socket.on('subNotice', (data)=>{
	console.log(socket.userName);
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
	



