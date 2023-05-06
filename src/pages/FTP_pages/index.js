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
      const input = document.getElementById("inputcommand");
      const value_command = input.value;
      input.value = "";

      // Send input command data to server
      socket.emit('input_command', value_command);
      // Reset input value

      if (value_command === "cls" || value_command === "clear") {
        //clear cmd output
        const inputElement = document.getElementById("output");
        inputElement.value = "";
      }
    }
  };

  return (
    <>
      <h1>This is the FTP page</h1>
      <h2>infomation User</h2>
      <div>
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
        <Window >
          <WindowHeader>TERMINAL.EXE</WindowHeader>
          <WindowContent style={{ margin: "0px", padding: "1px" }}>
            <div style={{ width:'800px', height:'500px' }} >
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
                fontSize: "16px",
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
          <div >
            <Button primary id="ssh_server_stop" onClick={stop_socket}>
              Disconnet
            </Button>
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

// function pass
// on click sumbit button
const onSubmit = (event) => {
  event.preventDefault();
  const { target } = event;

  const host = target.host.value;
  const port = target.port.value;
  const user = target.user.value;
  const password = target.pass.value;

  const data_form = {
    host: host,
    port: port,
    user: user,
    password: password,
  };

  //return JSON.stringify(data_form);
  connet_socket(data_form);
};

let socket;

// connet socket
function connet_socket(form) {
  socket = io("http://meowpong.serveminecraft.net:4000");
  socket.on("connect", () => {
    console.log("Connected to server!");
    Swal.fire({
      icon: "success",
      title: "Connet Socket",
      showConfirmButton: false,
      timer: 1500,
    });
  });

  //sent data form to socket server and connet to ssh
  socket.emit("sent_form", form);

  
  socket.on("output", (getdata) => {
    if (getdata.toString().trim() === "cls" || getdata.toString().trim() === "clear") {
      cleartext()
    }else{
      const inputElement = document.getElementById("output");
      inputElement.value +=  getdata 
    }
    


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
}

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