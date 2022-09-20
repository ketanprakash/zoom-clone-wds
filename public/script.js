const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const myPeer = new Peer();
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {};
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(myVideo, stream);
  
  myPeer.on('open', id => {
    console.log('room joined')
    socket.emit('join-room', ROOM_ID, id);
  })

  myPeer.on('call', call => {
    console.log('call received')
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
    })
  })

  socket.on('user-connected', userId => {
    console.log("user connected")
    connectToNewUser(userId, stream);
  })
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
})


function connectToNewUser(userId, stream){
  const call = myPeer.call(userId, stream);
  console.log('called')
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