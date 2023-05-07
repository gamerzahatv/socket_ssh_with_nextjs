const http = require("http");
const socketIO = require("socket.io");


function cleanOutput(data) {
  const cleanData = data
    .toString()
    .replace(/\x1B\[.*?m/g, "")
    .replace(/\x1B\[\??[0-9]*[A-Za-z]/g, "")
    .replace(/\x1B\][0-9];[^\x07]+\x07/g, "")
    .replace(/\x1B[\[\]A-Za-z0-9();><!?\*\^\$\\\/\+:\.,]*[\d;]*[A-Za-z@]/g, "")
    .replace(/\u001Bc|\x1Bc/g, "");
  return cleanData;
}

function getdatenow() {
  const now = new Date();
  const options = { timeZone: "Asia/Bangkok" };
  const dateInBangkok = now.toLocaleString("en-US", options);
  return dateInBangkok;
}

function get_roomdata(io, rooms) {
  const numClientsByRoom = new Map();
  const allRooms = io.sockets.adapter.rooms;
  const room = io.sockets.adapter.rooms.get(rooms);
  console.log(`***********************************| time update ${getdatenow()}|************************\n`)
  console.log(
    `ROOMNAME :  ${rooms}   \n`
  );


  if (room) {
    const clientIds = Array.from(room.keys());
    console.log(`ALL Client IDs in room ${rooms}: `, clientIds);
  } else {
    console.log(`Room ${rooms} does not exist`);
  }
  for (const [roomName, room] of allRooms) {
    if (!room.has(roomName)) {
      // Skip non-rooms
      const numClients = room.size;
      numClientsByRoom.set(roomName, numClients);
    }
  }
  console.log(
    "\n",
    "number of client per room",
    numClientsByRoom,
    "\n*******************************************************************************************\n"
  );
}

function startSocketServer() {
  const ssh_serverport = 4000;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end("<h1>Create socket server Succes!</h1>");
  });

  const io = socketIO(server, {
    cors: {
      origin: "*",
    },
  });


  // Get the client ID of the socket

  io.on("connection", (socket) => {
    socket.on("sent_form", (form) => {
      const rooms = `${form.host}  || ${socket.id}`
      socket.join(rooms);
      get_roomdata(io, rooms);

      // send infomation connet to client
      io.to(rooms).emit('information', rooms );

      const { Client } = require("ssh2");
      const conn = new Client();

      conn.on('ready', () => {

        io.to(rooms).emit('output', `you are in channel ${rooms}`);

        conn.shell((err, stream) => {
          if (err) {
            io.to(rooms).emit("output", err + "\n");
            return;
          }
          stream
          .on("close", () => {
            io.to(rooms).emit("output",'con end');
            conn.end();
          })

          .on("data", (getdata) => {
            const convert = cleanOutput(getdata);
            io.to(rooms).emit("output", convert + "\n");
          })

          .stderr.on("data", (getdata) => {
            const cleanData = cleanOutput(getdata);
            io.to(rooms).emit("output", `ERROR: ${cleanData}\n`);
          });

          socket.on("input_command", (value_command) => {
            stream.write(value_command.content + "\r\n");
          });


        });


        
      }).connect({
        host: form.host,
        port: form.port,
        username: form.user,
        password: form.password,
      });

      conn.on("error", (err) => {
        io.to(rooms).emit("output", err + "\n");
        //socket.emit("output", err + "\n");
        socket.leave(rooms);
      });
        /*
      conn.on("end", () => {
        console.log("SSH connection ended");
        conn.end();
      });*/
    });

    socket.on("disconnect", () => {
      //socket.disconnect();
      get_roomdata(io);
      console.log(`Client disconnected from socket server ssh`);
    });
    socket.on('leaveRoom', () => {
      io.to(rooms).emit("output", "client exit");
    });
  });

  server.listen(ssh_serverport, () => {
    console.log(`Socket server ssh running on port ${ssh_serverport}` + "\n");
  });
}

startSocketServer();
