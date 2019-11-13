//필요변수 설정
const voteBoard = document.querySelector('#vote');
const btnVote = document.querySelector('.voteButton');

// 최종 투표결과
let voteResult = [];

// icon 추가 및 연동? data = userList
socket.on('addIcon', (data)=>{
	

	// data 변수 설정
	const userList = data;
	
	// 들어간 이름 확인
	console.log(socket.name);
	// 일단 얘도 다 들어오면 삭제!
	while(voteBoard.hasChildNodes()){
		voteBoard.removeChild(voteBoard.firstChild);
	}
	
	// 아이콘 넣기
	for(let i=0;i<userList.length;i++){
		if(userList[i].conn==1){
			// 일반 아이콘
			if(userList[i].role!=3){
				// 아이콘 자체
				let userDiv = document.createElement('div');
				// 기본 IconClass
				let IconClass = 'user';
				// 각 아이콘마다 이름 넣어놓을까?
				const nameTag = document.createElement('p');
				nameTag.innerText = userList[i].userName;
				// userDiv 만들기
				userDiv.classList.add(IconClass);
				userDiv.appendChild(nameTag);
				//아이콘 클릭시
				userDiv.addEventListener('click', ()=>{
					//확인
					alert(`${userList[i].userName} Click!`);
					// click 하면 css 상태도 바꿔야 겠는데?
					userDiv.classList.toggle("user");
					// 얘는 한 명만 되게 해놔야 되는데... 
					userDiv.classList.toggle("selectedUser");
					// 값이 없으면 넣기 있으면 빼기
					if(!voteResult.includes(userList[i].userName)){
						voteResult.push(userList[i].userName);
						//확인
						console.log(voteResult);
					}else{
						const idx = voteResult.indexOf(userList[i].userName);
						voteResult.splice(idx,1);
						// 확인
						console.log(voteResult);
					}

				});
				// 최종 넣기
				voteBoard.appendChild(userDiv);
			// 시체 전용 아이콘
			}else {
				// 아이콘 자체
				let userDiv = document.createElement('div');
				// class
				let IconClass = 'undead'
				// 각 아이콘마다 이름 넣어놓을까?
				const nameTag = document.createElement('p');
				nameTag.innerText = userList[i].userName;
				// userDiv 만들기
				userDiv.classList.add(IconClass);
				userDiv.appendChild(nameTag);
				//아이콘 클릭시
				userDiv.addEventListener('click', ()=>{
					//확인
					alert(`${userList[i].userName} Click!`);
					

				});
				// 최종 넣기
				voteBoard.appendChild(userDiv);
			}
		}
	}

	
});
btnVote.addEventListener('click', killUser);


// 사람 죽이는 메소드 (현재는 한명이 누르면 바로 킬)
function killUser(){
	// 아무도 선택되지 않았을 경우 
	if(voteResult.length<1){
		alert("반드시 한 명을 선택해주세요!");
	// 한 명 이상 선택했을 경우 
	}else if(voteResult.length>1){
		alert("한 명만 선택해주세요!");
	// 한 명을 잘 선택했을 경우
	}else{
		// 확인하고
		console.log(voteResult[0]);
		// 서버로 킬 요청 보내자.
		socket.emit('killUser', voteResult[0]);
		// 보내고 나면 초기화!!

	}
	
}

// 본인의 소켓이 방 이동하라고 요청받았을 경우
socket.on('moveRoom', (data)=>{
	console.log("내가 방 이동 요청 받음")
	socket.emit('changeRoom', socket.name);
});