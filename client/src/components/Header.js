import React, { useState } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Container } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';

const Header = () => {
  const [uname, setUName] = useState(null);
  const handleOnNameChange = (uname) => {
    setUName(uname);
  };
  let val1 = true;
  let val2 = false;
  const cookies = document.cookie;

  const cookiesArray = cookies.split('; ');

  let token = null;
  cookiesArray.forEach((cookie) => {
    const [name, value] = cookie.split('=');
    if (name === 'token') {
      token = value;
    }
  });
  if (token) {
    val1 = false;
    val2 = true;
    fetch('http://3.84.20.224:5000/userDtl', {
      method: 'POST',
      // crossDomain ,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        token: window.localStorage.getItem('token'),

      }),
    })
      .then((res) => res.json())
      .then((data) => {
        handleOnNameChange(data.user.user.name);
      });
  }

  return (

    <Navbar bg="light" expand="lg" fixed="top">
      <Container fluid>
        <Navbar.Brand href="#home">
          <Container className="text-purple">
            <Icon.CircleFill />{' '}
            THE SCRUTINIZER
          </Container>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">

            <Nav.Link href="http://home.scrutinizer.online/">Home</Nav.Link>
            <Nav.Link href="">About</Nav.Link>
            <Nav.Link href="">Contact</Nav.Link>
            <Nav.Link href="http://home.scrutinizer.online/Login" hidden={val2}>Login</Nav.Link>

            <Nav.Link href="http://home.scrutinizer.online/Profile" hidden={val1}>
              <Icon.PersonCircle className=" fs-5" />{' '}
              {(uname)}
            </Nav.Link>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
