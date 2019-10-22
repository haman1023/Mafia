let socket = io();

/* 접속되었을 때 실행 */
socket.on('connect', () => {
	/* 이름 입력 받기*/
	let name = prompt('반갑습니다!','');
	/* 이름이 빈칸일 때*/
	if(!name) {
		name ="익명";
	}
	/* 서버에 새로운 유저가 온 것을 알림 */
	socket.emit('newUser', name)

});

/* 서버로부터 데이터를 받은 경우 */
socket.on('update', (data) => {
	/* 채팅에 필요한 부분 생성*/
	const chatWindow = document.querySelector('.sub_chat');

	const chatLine = document.createElement('div');
	const node = document.createTextNode(`${data.name}: ${data.message}`);
	let className = '';

	/* className 다르게 넣어 채팅 줄 종류 설정 */
	switch(data.type) {
		/* 새 유저가 들어왔을 때 */
		case 'connect':
					className = 'login';
					break;
		/* 남이 보낸 메시지 */
		case 'message':
			className = 'other';
			break;
		/* 연결 해제 되었을 때 */
		case 'disconnect':
			className = 'logout'
			break;
	}
	/* 채팅 줄 형성하기 */
	chatLine.classList.add(className);
	chatLine.appendChild(node);
	chatWindow.appendChild(chatLine);
});

/* 메시지 전송 함수 */
function send() {
	//입력데이터 갖오기
	let message = document.querySelector('.sub_chat_text').value;

	

	// 내가 전송할 메시지 클라이언트에 표시 
	const chatWindow = document.querySelector('.sub_chat');
	const chatLine = document.createElement('div');
	const node = document.createTextNode(message);

	chatLine.classList.add('my')
	chatLine.appendChild(node);
	chatWindow.appendChild(chatLine);

	

	// 서버로 message 이벤트, 데이터 전달
	socket.emit('message', {type: 'message', message: message});

	// 데이터 가져온 뒤 빈 칸으로 만들기
	message = '';
}