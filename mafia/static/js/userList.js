// 리스트 받을 때마다 갱신되게 하기
socket.on('userList', (data)=>{
	console.log(data);
	const userList = data;
	// list 관련 틀 만들기
	const listBox = document.querySelector('.user_list');
	//중복되지 않게 비우기
	while(listBox.hasChildNodes()){
		listBox.removeChild(listBox.firstChild)
	}


	// 연결 상태일 때만 표시하게끔
	for(let i=0;i<userList.length;i++){
		const listLine = document.createElement('div');
		if(userList[i].conn===1){
			const node = document.createTextNode(userList[i].userName);
			listLine.appendChild(node);
			listBox.appendChild(listLine);
		}
		
	}

	

});