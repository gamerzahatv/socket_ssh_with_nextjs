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
import React, { useState, useEffect,  useRef } from "react";
import io from "socket.io-client";




const IndexFtp = () => {

  // Handle input command key press
  const handleKeyPress = (event) => {
    // If key pressed is Enter, send the command to the server
    if (event.key === "Enter") {
      // Prevent default form submission
      event.preventDefault();
      //clear inputcommand
      const input = document.getElementById("inputcommand");
      const value_command = input.value;
      input.value = "";


      // Send input command data to server
      socket.emit('input_command',  value_command)
    
      if (value_command === "cls" || value_command === "clear") {
        //clear cmd output
        const inputElement = document.getElementById("output");
        inputElement.value = "";
      }
    }
  };

  return (
    <>
      <h1 style={{ textAlign: "center" }}>SSH</h1>
      <h2 id = 'status' style={{ textAlign: "center" }}>YOU ARE NOT CONNET</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
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
      <div>
        <Window style={{ minWidth: "100%" }}>
          <WindowHeader>TERMINAL.EXE</WindowHeader>
          <WindowContent style={{ margin: "0px", padding: "1px" }}>
            <div style={{ height: "500px" }}>
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
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button primary id="ssh_server_stop" onClick={stop_socket}>
            Disconnet
          </Button>
          &nbsp; &nbsp;
          <Button primary id="cleartext" onClick={cleartext}>
            Cleartext
          </Button>
        </div>
      </div>
      <br />
      <br />
      <h2>CMD test </h2>
      
      



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
    user: target.user.value,
    password: target.pass.value,
  };

  socket = io("http://localhost:12123/");
  socket.on("connect", () => {
    console.log("Connected to server!");
    Swal.fire({
      icon: "success",
      title: "Connet Socket",
      showConfirmButton: false,
      timer: 1500,
    });

    //sent data form to socket server and connet to ssh
    socket.emit("sent_form", data_form);

    //get data from server
    socket.on("information", (information) => {
      const getstatus = document.getElementById("status");
      getstatus.textContent= `You are in Channel ${information}`;
    });

    socket.on("output", (getdata) => {
      const inputElement = document.getElementById("output");
      inputElement.value += getdata;
    });

    socket.on("connect_error", () => {
      Swal.fire({
        icon: "error",
        title: "Socket Server Error or  entered wrong information",
        text: "Please restart Socket Server! or check information again",
      });
      socket.disconnect();
      socket = null;
    });

    socket.on("disconnect", () => {
      const getstatus = document.getElementById("status");
      getstatus.textContent= `YOU ARE NOT CONNET`;
      //socket.disconnect();
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
    socket.disconnect();
    const getroom = document.getElementById("inputcommand");
    getroom.value = "";
    //socket.close();
    //socket = null;
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: "error",
      title: "You are not already connet socket",
    });
  }
}

function cleartext() {
  const inputElement = document.getElementById("output");
  inputElement.value = "";
}
