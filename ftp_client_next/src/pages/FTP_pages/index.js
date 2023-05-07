import {
  Button,
  Frame,
  TextInput,
  Checkbox,
  GroupBox,
  ScrollView,
  Window,
  WindowContent,
  WindowHeader,
} from "react95";
import Swal from "sweetalert2";
import React, { useState, useEffect, useCallback } from "react";
import io from "socket.io-client";

const IndexFtp = () => {
  // Define value_command state

  // Handle input command key press
  const handleKeyPress = (event) => {
    // If key pressed is Enter, send the command to the server
    if (event.key === "Enter") {
      // Prevent default form submission
      event.preventDefault();
      //clear inputcommand
      const input = document.getElementById('inputcommand');
      const value_command = input.value;
      input.value = "";
      //get client room
      const getroom = document.getElementById('room');
      const getroomvalue= getroom.value;

      // Send input command data to server
      socket.emit('input_command', { content: value_command, room: getroomvalue });


      if (value_command === "cls" || value_command === "clear") {
        //clear cmd output
        const inputElement = document.getElementById("output");
        inputElement.value = "";
      }
    }
  };

  return (
    <>
      <h1 style={{textAlign:'center'}}>SSH</h1>
      <input type='hidden' name="room"  id = 'room'  disabled  />
      <div style={{display:'flex' , justifyContent:'center'}}>
        <Window>
          <WindowHeader>SSH.EXE</WindowHeader>
          <WindowContent>
            <GroupBox label="Fill out to connect SSH">
              <form onSubmit={onSubmit}>
                <TextInput placeholder="host" fullWidth required name="host" />
                <TextInput placeholder="port" fullWidth required name="port" />
                <TextInput placeholder="user" fullWidth required name="user" />
                <TextInput
                  placeholder="password"
                  fullWidth
                  required
                  name="pass"
                />

                <br />
                <div style={{ margin: "auto", width: "75%" }}>
                  <Button primary type="submit">
                    Submit
                  </Button>
                  &nbsp;
                  <Button primary type="reset">
                    reset
                  </Button>
                </div>
              </form>
            </GroupBox>
          </WindowContent>
        </Window>
      </div>

      <h2>CMD command </h2>

      <div >
        <Window  style={{minWidth:'100%'}}>
          <WindowHeader>TERMINAL.EXE</WindowHeader>
          <WindowContent style={{ margin: "0px", padding: "1px" }} >
            <div style={{  height:'500px'}} >
            <textarea
              readOnly={true}
              id="output"
              name="w3review"
              style={{
                borderRadius: "0px",
                width: "100%",
                height: "100%",
                backgroundColor: "black",
                color: "#10E717",
                resize: "none",
              }}
            ></textarea>
            </div>
          </WindowContent>
          <TextInput
            id="inputcommand"
            onKeyPress={handleKeyPress}
            placeholder="input command"
            fullWidth
          />
        </Window>
        <br />
        <br />
          <div style={{display:'flex' , justifyContent:'center'}}>
            <Button primary id="ssh_server_stop" onClick={stop_socket}>
              Disconnet
            </Button>
            &nbsp;
            &nbsp;
            <Button primary id="cleartext" onClick={cleartext}>
              Cleartext
            </Button>
          </div>
      </div>
      <br />
      <br />
    </>
  );
};

export default IndexFtp;

let socket;
// on click sumbit button
const onSubmit = (event) => {
  event.preventDefault();
  const { target } = event;


  const data_form = {
    host: target.host.value,
    port: target.port.value,
    user:  target.user.value,
    password: target.pass.value,
  };

  socket = io("http://meowpong.serveminecraft.net:4000");
  socket.on("connect", () => {
    console.log("Connected to server!");
    Swal.fire({
      icon: "success",
      title: "Connet Socket",
      showConfirmButton: false,
      timer: 1500,
    });

    //sent data form to socket server and connet to ssh
    socket.emit('sent_form', data_form);

    //get data from server
    socket.on('information', (information) => {
      console.log(information)
      const getroom = document.getElementById("room");
      getroom.value =  information
    });

    socket.on("output", (getdata) => {
      const inputElement = document.getElementById("output");
      inputElement.value +=  getdata 
    });
    
    socket.on("connect_error", () => {
      Swal.fire({
        icon: 'error',
        title: 'Socket Server Error or  entered wrong information',
        text: 'Please restart Socket Server! or check information again',
      })
      socket.disconnect();
      socket.close();
      socket = null
    });
  
    socket.on("disconnect", () => {
      //socket.disconnect();
      //socket.close();
      //socket = null;
      Swal.fire({
        icon: "success",
        title: "Disconnect",
        showConfirmButton: false,
        timer: 1500,
      });
      const inputElement = document.getElementById("output");
      inputElement.value = "";
    });
  });


};





// disconnet socket
function stop_socket() {
  try {
    const close_connet = socket.close();
    if (close_connet) {
      Swal.fire({
        icon: "success",
        title: "Socket connection closed",
        showConfirmButton: false,
        timer: 1500,
      });
      //socket = null;
    }
    socket.disconnect();
    const getroom = document.getElementById('inputcommand');
    getroom.value = ''
    //socket.close();
    socket = null;
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "You are not already connet socket",
    });
  }
}


function cleartext(){
  const inputElement = document.getElementById("output");
  inputElement.value = "";
}