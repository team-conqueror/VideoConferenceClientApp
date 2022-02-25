import React, { useContext, useRef } from 'react';
import { Grid, Typography, Paper, makeStyles, Button } from '@material-ui/core';

import { Card } from 'antd';
import { CameraOutlined, EditOutlined, EllipsisOutlined, SettingOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Assignment, CallMerge, Camera, CameraRounded, MicOff, SwitchCamera } from '@material-ui/icons';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { SocketContext } from '../Context';

const useStyles = makeStyles((theme) => ({
  video: {
    borderRadius: '5px',
    padding: '0',
    width: '550px',
    [theme.breakpoints.down('xs')]: {
      width: '300px',
    },
  },
  gridContainer: {
    justifyContent: 'end',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
    },
  },
  paper: {
    padding: '10px',
    margin: '10px',
  },
}));

const VideoPlayer = () => {
  const { role, callAccepted, myVideo, userVideo, callEnded, stream, call, canvasRef, me, isVideoEnable, isAudioEnable, setIsAudioEnable, setIsVideoEnable } = useContext(SocketContext);
  const classes = useStyles();

  return (
    <Grid container className={classes.gridContainer}>
      {stream && role === 'student' && (
        <Card
          hoverable
          style={{ marginTop: 50, padding: 0, width: 550, height: 475, marginRight: 10 }}
          cover={(
            <Grid item xs={12} md={6}>
              <video height={413} playsInline muted ref={myVideo} autoPlay className={classes.video} />
            </Grid>
              )}
          actions={[
            <Camera onClick={() => setIsVideoEnable(!isVideoEnable)} />,
            <MicOff key="edit" onClick={() => setIsAudioEnable(!isAudioEnable)} />,
            <CopyToClipboard text={me}>
              <Assignment />
            </CopyToClipboard>,
          ]}
        />
      )}
      {callAccepted && !callEnded && role !== 'student' && (
        <Card
          hoverable
          style={{ marginTop: 50, padding: 0, width: 550, height: 475, marginLeft: 10 }}
          cover={(
            <Grid item xs={12} md={6}>
              <video playsInline ref={userVideo} autoPlay className={classes.video} />
              <canvas ref={canvasRef} hidden />
            </Grid>
        )}
          actions={[
            <Camera color={isVideoEnable ? 'info' : 'error'} onClick={() => setIsVideoEnable(!isVideoEnable)} />,
            <MicOff color={isAudioEnable ? 'info' : 'error'} key="edit" onClick={() => setIsAudioEnable(!isAudioEnable)} />,
            <CopyToClipboard text={me}>
              <Assignment />
            </CopyToClipboard>,
          ]}
        />
      )}
    </Grid>
  );
};

export default VideoPlayer;
