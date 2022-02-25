import React, {useContext, useState} from 'react';

import {Modal} from 'antd';
import {SocketContext} from '../Context';

const Notifications = () => {
  const { answerCall, call, callAccepted, user } = useContext(SocketContext);

  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleOk = () => {
    setIsModalOpen(false);
    answerCall();
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {call.isReceivingCall && !callAccepted && (
        <Modal title="Request for join room" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
          <p>{user.name} request permission to join to the room</p>
        </Modal>
      )}
    </>
  );
};

export default Notifications;
