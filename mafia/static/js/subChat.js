let chattingRoom = [
	{_id: 'mainChatRoom', members:[]},
	{_id: 'subChatRoom', members:[]}
];

socket.on('joinRoom', (name) => {
	console.log(`${name} 님이 접속하였습니다.`);
	const subChatBox = document.querySelector('.sub_chat');
	const subChatLine = document.createElement('div');
	const subNode = document.createTextNode(`${name}님이 접속하였습니다.`);

	subChatLine.appendChild(subNode);
	subChatBox.appendChild(subChatLine);
})

socket.on('subOtherMessage', (data) => {
	console.log(data);
	const subChatWindow = document.querySelector('.sub_chat');
	const subChatLine = document.createElement('div');
	const subNode = document.createTextNode(`${data.name}: ${data.subMessage}`);

	subChatLine.appendChild(subNode);
	subChatWindow.appendChild(subChatLine);

})


/* 메시지 전송 함수 */
function subSend() {
	//입력데이터 갖오기
	const subMessage = document.querySelector('.sub_chat_text').value;

	

	// 내가 전송할 메시지 클라이언트에 표시 
	const subChatWindow = document.querySelector('.sub_chat');
	const subChatLine = document.createElement('div');
	const subNode = document.createTextNode(subMessage);

	// subChatLine.classList.add('my')
	subChatLine.appendChild(subNode);
	subChatWindow.appendChild(subChatLine);

	

	// 서버로 subChatRoom의 subMessage 이벤트, 데이터 전달
	socket.emit('subMessage', {type: 'subMessage', subMessage: subMessage});

	// 데이터 가져온 뒤 빈 칸으로 만들기
	document.querySelector('.sub_chat_text').value = "";
}

