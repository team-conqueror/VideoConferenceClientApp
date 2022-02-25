import React, {createContext, useEffect, useRef, useState} from 'react';
import {io} from 'socket.io-client';
import Peer from 'simple-peer';
import {notification} from 'antd';
import {getUserRole} from "./utils/user";

const SocketContext = createContext();

async function getUserByToken() {
  const cookies = document.cookie;

  const cookiesArray = cookies.split('; ');

  let token = null;
  cookiesArray.forEach((cookie) => {
    const [name, value] = cookie.split('=');
    if (name === 'token') {
      token = value;
    }
  });
  try {
    const response = await fetch('http://3.84.20.224:5000/userDtl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        token,
      }),
    });

    if (response.ok) {
      const { user } = await response.json();
      return user.user;
    }
    throw new Error('Failed to fetch user ID');
  } catch (error) {
    console.error(error);
  }
}

// let socket = io('http://0.0.0.0:8082', {
//   query: { id: sessionStorage.getItem('id') },
// });

const ContextProvider = ({ children }) => {
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [stream, setStream] = useState();
  const [name, setName] = useState('');
  const [call, setCall] = useState({});
  const [me, setMe] = useState('');
  const [isVideoEnable, setIsVideoEnable] = useState(true);
  const [isAudioEnable, setIsAudioEnable] = useState(true);
  const [result, setResult] = useState('');
  const [userId, setUserId] = useState('');
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    getUserByToken().then((user) => {
      const newSocket = io('http://3.228.220.143:8082/', {
        query: { id: user._id },
      });
      setUser(user);
      setRole(getUserRole(user.role));
      setSocket(newSocket);
    });
  }, []);

  const [api, contextHolder] = notification.useNotification();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const canvasRef = useRef();
  const imageRef = useRef();

  const openNotificationWithIcon = (type, title, msg) => {
    api[type]({
      message: title,
      description: msg,
    });
  };

  notification.config({
    placement: 'bottomRight',
    bottom: 50,
    duration: 3,
    rtl: true,
  });

  useEffect(() => {
    console.log(socket);
    if (socket) {
      if ((isVideoEnable || isAudioEnable) && role === 'student') {
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then((currentStream) => {
            setStream(currentStream);

            myVideo.current.srcObject = currentStream;
          });
      }
      socket.on('me', (id) => setMe(id));

      socket.on('callUser', ({ from, name: callerName, signal }) => {
        setCall({ isReceivingCall: true, from, name: callerName, signal });
      });
    }
  }, [socket, role]);

  useEffect(() => {
    console.log(me);
  }, [me]);

  // useEffect(() => {
  //   switch (result) {
  //     case 'RIGHT':
  //       openNotificationWithIcon('error', 'Strange Behaviour Detected', "Please look forward, currently you're looking at right");
  //       break;
  //     case 'LEFT':
  //       openNotificationWithIcon('error', 'Strange Behaviour Detected', "Please look forward, currently you're looking at left");
  //       break;
  //     case 'NO_FACE_DETECTED':
  //       openNotificationWithIcon('error', 'No Any Face Detected', "You're moving away, Please stay in the frame");
  //       break;
  //     default:
  //       break;
  //   }
  // }, [result]);

  const showWarning = (text) => {
    switch (text) {
      case 'RIGHT':
        openNotificationWithIcon('error', 'Strange Behaviour Detected 👉', 'Candidate is currently looking at right');
        break;
      case 'LEFT':
        openNotificationWithIcon('error', 'Strange Behaviour Detected 👈', 'Candidate is currently looking at left');
        break;
      case 'NO_FACE_DETECTED':
        openNotificationWithIcon('error', 'No Any Face Detected 🫣', 'Candidate is not in the frame');
        break;
      default:
        break;
    }
  };

  const captureImageFromCamera = () => {
    const context = canvasRef.current.getContext('2d');
    const { videoWidth, videoHeight } = userVideo.current;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    context.drawImage(userVideo.current, 0, 0, videoWidth, videoHeight);
    canvasRef.current.toBlob((blob) => {
      imageRef.current = blob;
    });
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (role === 'teacher' && userVideo.current !== undefined) {
        captureImageFromCamera();

        if (imageRef.current) {
          const formData = new FormData();
          formData.append('image', imageRef.current);
          const response = await fetch('http://34.206.39.5:8080/classify', {
            method: 'POST',
            body: formData,
          });
          if (response.status === 200) {
            const text = await response.text();
            // setResult(text);
            showWarning(text);
            console.log(text);
          } else {
            setResult('Error from API.');
          }
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [name, role]);

  const answerCall = () => {
    setCallAccepted(true);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on('signal', (data) => {
      socket.emit('answerCall', { signal: data, to: call.from });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    peer.signal(call.signal);

    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    console.log(id, me);

    peer.on('signal', (data) => {
      socket.emit('callUser', { userToCall: id, signalData: data, from: me, name });
    });

    peer.on('stream', (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    socket.on('callAccepted', (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    window.location.reload();
  };

  return (
    <SocketContext.Provider value={{
      call,
      callAccepted,
      myVideo,
      userVideo,
      stream,
      name,
      setName,
      callEnded,
      me,
      user,
      callUser,
      leaveCall,
      answerCall,
      canvasRef,
      contextHolder,
      isVideoEnable,
      isAudioEnable,
      setIsAudioEnable,
      setIsVideoEnable,
      role,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
