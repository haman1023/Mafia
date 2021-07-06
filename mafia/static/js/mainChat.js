// 관련 변수 들고 오기
const mainChatText = document.querySelector(".main_chat_text");
const mainChatSend = document.querySelector(".main_chat_send");

// 스크롤 밑으로 
function gotoBottom(cls){
	const element = document.querySelector(cls);
	element.scrollTop = element.scrollHeight-element.clientHeight;
}

// 엔터로 메시지 보내기
function keySendMessage(key){
	if(key.keyCode==13){
		sendMessage();
		mainChatText.focus();
	}
}

function sendMessage(event){
	// 메시지 가져오기
	const message = mainChatText.value;
	// 메시지를 적었을 때만 전송 가능
	if(message!=""){
		// 내가 전송한 메시지 채팅창에 표시
		const chatWindow = document.querySelector('.main_chat');
		const chatLine = document.createElement('div');
		const node = document.createTextNode(`나 : ${message}`);

		chatLine.classList.add('my')
		chatLine.appendChild(node);
		chatWindow.appendChild(chatLine);
		// // 스크롤 밑으로
		gotoBottom('.main_chat');


		// 서버로 메시지와 필요 데이터 전달
		socket.emit('sendMsg', {type: 'mainMsg', message: message});

		// 입력창 비우기
		document.querySelector('.main_chat_text').value="";
	}
}
// 메시지 받아서 표시
socket.on('mainMsg', (data)=>{
	const chatWindow = document.querySelector('.main_chat');
	const chatLine = document.createElement('div');
	const node = document.createTextNode(`${data.name} : ${data.message}`);

	chatLine.classList.add('other');
	chatLine.appendChild(node);
	chatWindow.appendChild(chatLine);
})

// 시체는 메인채팅 밴
socket.on('cannotSend', (data)=>{
	if(data=='tomb'){
		alert("시체는 말이 없다!");
		// 메시지 내용이 있을 때만 보내지니까 input을 닫아버리자. 
		mainChatText.disabled =true;
	}
});

function init(){
	mainChatText.focus();
	mainChatText.addEventListener('keydown',keySendMessage);
	mainChatSend.addEventListener('click',sendMessage);
}

init();

