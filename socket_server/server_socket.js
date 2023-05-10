const http = require("http");
const socketIO = require("socket.io");
const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const logDir = 'log';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'results.log');

const logger = createLogger({


  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.json()
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        format.printf(
          info => `${info.timestamp} ${info.level}: ${info.message}`
        )
      )
    }),
    new transports.File({ filename })
  ]
});

// logger.error('error message');
// logger.warn('warn message');
// logger.info('info message');
// logger.verbose('verbose message');
// logger.debug('debug message');
// logger.silly('silly message');

function cleanOutput(data) {

  const cleanData = data
    .toString()
    .replace(/\x1B\[.*?m/g, "")
    .replace(/\x1B\[\??[0-9]*[A-Za-z]/g, "")
    .replace(/\x1B\][0-9];[^\x07]+\x07/g, "")
    .replace(/\x1B[\[\]A-Za-z0-9();><!?\*\^\$\\\/\+:\.,]*[\d;]*[A-Za-z@]/g, "")
    .replace(/\u001Bc|\x1Bc/g, "")
    .replace(/\x07/g, '')
    .replace(/\x08/g, '')
    .replace(/\x1B\[.*?m/g, "") // remove color codes
    .replace(/\x1B\[\??[0-9]*[A-Za-z]/g, "") // remove special codes
    .replace(/\x1B\][0-9];[^\x07]+\x07/g, "") // remove window title commands
    .replace(/\x1B[\[\]A-Za-z0-9();><!?\*\^\$\\\/\+:\.,]*[\d;]*[A-Za-z@]/g, "") // remove all other escape sequences
    .replace(/\u001Bc|\x1Bc/g, "") // remove clear screen commands
    .replace(/\x07/g, '') // remove audible bell characters
    .replace(/\x1b\[([0-9;]*)?[A-Za-z]/g, '') // Remove escape sequences
    .replace(/\r/g, '\n') // Convert carriage returns to newlines
    .replace(/\x08/g, '\b'); // Convert backspace characters to the backspace control character
    
  return  cleanData.trim();
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
  console.log(`**************************|ROOM STATUS UPDATE TIME : ${getdatenow()}|********************\n`)
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
    console.log(`client : ${socket.id}  connet  time : ` , getdatenow() )
   
    socket.on("sent_form", (form) => {
      const rooms = `${form.host}  || ${socket.id}`
      socket.join(rooms);
      logger.info(`client : ${socket.id} in channel ${rooms} connet `);
      get_roomdata(io, rooms);

      // send infomation connet to client
      io.to(rooms).emit('information', rooms );

      const { Client } = require("ssh2");
      const conn = new Client();

      conn.on('ready', () => {

        io.to(rooms).emit('output', `you are in channel ${rooms}`);

        conn.shell({ term: 'xterm' },(err, stream) => {
          if (err) {
            io.to(rooms).emit("output", err );
            return;
          }
              // Set the initial window size
          stream.setWindow(process.stdout.rows, process.stdout.columns);

          // Update the window size when the terminal is resized
          process.stdout.on('resize', () => {
            stream.setWindow(process.stdout.rows, process.stdout.columns);
          });

          stream
          .on("close", () => {
            io.to(rooms).emit("output",'con end');
            conn.end();
          })

          .on("data", (getdata) => {
            //const result = decodeURIComponent(escape(getdata.toString()));
           
            //io.to(rooms).emit("output", getdata.toString()+'\n')
            io.to(rooms).emit("output",cleanOutput(getdata)+'\n')
            //console.log(getdata.toString())
            //const jsonData = JSON.parse(getdata.toString());
            //io.to(rooms).emit("output", getdata.toString()); 


          })

          .stderr.on("data", (getdata) => {
            const cleanData = cleanOutput(getdata);
            io.to(rooms).emit("output", `ERROR: ${cleanData}`);
            
          });

          socket.on("input_command", (value_command) => {
            stream.write(value_command+ "\r");
            logger.info(`Client Socket id ${socket.id} in channel ${rooms} write command ${value_command}`)
          });




        });


        
      }).connect({
        host: form.host,
        port: form.port,
        username: form.user,
        password: form.password,
      });

      conn.on("error", (err) => {
        io.to(rooms).emit("output", err );
        logger.error('error message');
        //socket.emit("output", err + "\n");
        socket.leave(rooms);
      });
  
      conn.on("end", () => {
        console.log("SSH connection ended");
        conn.end();
      });

      socket.on("disconnect", () => {
        logger.info(`Client Socket id ${socket.id} Disconnet Delete Room...${rooms}`)
        socket.leave(rooms);
        console.log(`Client Socket id ${socket.id} Disconnet Delete Room...`+'\n');
        get_roomdata(io);
      });

      socket.on('leaveRoom', () => {
        io.to(rooms).emit("output", "client exit");
      });
    });



  });

  server.listen(ssh_serverport, () => {
    console.log(`Socket server ssh running on port ${ssh_serverport}` + "\n");
  });
}

startSocketServer();
