
/* 자신이 접속했을 때 모든 접속자 정보 받아서 서버에서 리스트 추가하면서 생성
	사용자가 처음 접속했을 때는 있던 리스트를 불러와서 목록 만들기
	하던 도중 다른 사람이 들어왔을 때는 update 이용해서 list에 push하고, 리스트 밑에 하나 더 추가하는 식으로 하면
	문제 없이 돌아갈 듯. 
*/
/* 접속했을 때 접속자 리스트를 표시하자 */
socket.on('initUserList', (data) => {
	

	
	const userList = data.list;
	const listBox = document.querySelector('.user_list')
	console.log(userList);

	while(listBox.hasChildNodes()){
		listBox.removeChild(listBox.firstChild);
	}

	for(let i=0;i<userList.length;i++){
		const listLine = document.createElement('div');
		const node = document.createTextNode(userList[i]);
		console.log(userList[i]);
		console.log(node);
		listLine.appendChild(node);
		listBox.appendChild(listLine);
	}
	

	
});


