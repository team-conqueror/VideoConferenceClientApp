import React, {useContext} from 'react';
import {makeStyles} from '@material-ui/core/styles';

import {Col, Row} from 'antd';
import ReactLoading from 'react-loading';
import VideoPlayer from './components/VideoPlayer';
import Sidebar from './components/Sidebar';
import Notifications from './components/Notifications';
import {SocketContext} from './Context';
import Chat from './components/Chat/Chat';
import Header from './components/Header';
import './Assets/Style/Main.scss';

const useStyles = makeStyles((theme) => ({
  appBar: {
    borderRadius: 15,
    margin: '30px 100px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '600px',
    border: '2px solid black',

    [theme.breakpoints.down('xs')]: {
      width: '90%',
    },
  },
  image: {
    marginLeft: '15px',
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  loading: {
    position: 'absolute',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const App = () => {
  const classes = useStyles();
  const { contextHolder, user } = useContext(SocketContext);

  if (!user) {
    return (
      <div className={classes.loading}>
        <ReactLoading
          type="bars"
        />
      </div>
    );
  }

  return (

    <div className={classes.wrapper}>
      <Header />

      {contextHolder}
      <Row>
        <Col style={{ marginTop: '150px' }} span={10}>
          <VideoPlayer />
          <Sidebar>
            <Notifications />
          </Sidebar>
        </Col>
        <Col span={14}>
          <Chat />
        </Col>
      </Row>
    </div>
  );
};

export default App;
