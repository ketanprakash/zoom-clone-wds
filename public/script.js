const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');
const leaveButton = document.getElementById('leave-call-button');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);
  myPeer.on('open', id => {
    const joinButton = document.getElementById('join-call-button');
    joinButton.addEventListener('click', () => {
      socket.emit('join-room', ROOM_ID, id);
      const div = document.createElement('div');
      div.textContent = `Joined Room ${ROOM_ID}`;
      div.classList.add('joined-room');
      document.querySelector('body').append(div);
    })
  })

  myPeer.on('call', call => {
    peers[call.peer] = call;
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
    call.on('close', () => {
      video.remove();
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})

leaveButton.addEventListener('click', () => {
  console.log("leaving call");
  socket.emit('leave-room');
  const videoGrid = document.getElementById("video-grid");
  videoGrid.innerHTML = "";
  document.querySelector('.joined-room').textContent = "Left Room";
})

function connectToNewUser(userId, stream){
  const call = myPeer.call(userId, stream);

  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  })

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })
  videoGrid.append(video);
}