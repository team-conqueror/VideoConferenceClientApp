import React, { createContext, useState, useRef, useEffect } from 'react';
import { io } from 'socket.io-client';
import Peer from 'simple-peer';
import { notification } from 'antd';
import { parse } from 'querystring';

const SocketContext = createContext();

const socket = io('http://0.0.0.0:8082', {
  query: { id: sessionStorage.getItem('id') },
});

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

  const [api, contextHolder] = notification.useNotification();

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const canvasRef = useRef();
  const imageRef = useRef();

  const currentRole = sessionStorage.getItem('role');

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
    const id = sessionStorage.getItem('id');
    setUserId(id);
    console.log(me);
  }, [me]);

  useEffect(() => {
    console.log(isAudioEnable, isVideoEnable);
    if ((isVideoEnable || isAudioEnable) && currentRole === 'student') {
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
  }, []);

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
        openNotificationWithIcon('error', 'Strange Behaviour Detected 👉', "Please look forward, currently you're looking at right");
        break;
      case 'LEFT':
        openNotificationWithIcon('error', 'Strange Behaviour Detected 👈', "Please look forward, currently you're looking at left");
        break;
      case 'NO_FACE_DETECTED':
        openNotificationWithIcon('error', 'No Any Face Detected 🫣', "You're moving away, Please stay in the frame");
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
      if (currentRole === 'teacher' && userVideo.current !== undefined) {
        captureImageFromCamera();

        if (imageRef.current) {
          const formData = new FormData();
          formData.append('image', imageRef.current);
          const response = await fetch('http://0.0.0.0:5000/angle', {
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
  }, [name]);

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
      callUser,
      leaveCall,
      answerCall,
      canvasRef,
      contextHolder,
      isVideoEnable,
      isAudioEnable,
      setIsAudioEnable,
      setIsVideoEnable,
    }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
