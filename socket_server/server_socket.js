const http = require("http");
const socketIO = require("socket.io");
const { Client } = require("ssh2");

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

  const conn = new Client();


  io.on("connection", (socket) => {
    console.log("client connected");
    socket.on("sent_form", (form) => {
      const host = form.host;
      const port = form.port;
      const user = form.user;
      const password = form.password;
      conn
        .on("ready", () => {
          console.log("Client :: ready");
          conn.on("error", (err) => {
            socket.emit("output", err + "\n");
            conn.end();
          });
          

          conn.shell((err, stream) => {
            if (err) {
              socket.emit("output", err + "\n");
              return;
            }

            stream
              .on("close", () => {
                console.log("Stream :: close");
                conn.end();
              })
              .on("data", (getdata) => {
                const convert = cleanOutput(getdata);
                socket.emit("output", convert + "\n");
                //console.log('sent data')
                //console.log(`STDOUT: ${getdata}`);
              })
              .stderr.on("data", (getdata) => {
                const cleanData = cleanOutput(getdata);

                socket.emit("output", `ERROR: ${cleanData}\n`);
                //console.log(`STDERR: ${getdata}`);
              });
            socket.on("input_command", (value_command) => {
              stream.write(value_command + "\r\n");
            });

            socket.on("disconnect", () => {
              conn.end();
              stream.end();
              socket.disconnect();
              //socket.close();
              console.log(`Client disconnected from socket server ssh`);
              //delete conn
              //delete host
              //delete port
              //delete user
              //delete password
            });

            socket.on("connect_error", () => {
              socket.close();
              socket = null;
            });
          });
        })
        .connect({
          host: host,
          port: port,
          username: user,
          password: password,
        });
        conn.on('end', () => {
          console.log('SSH connection ended');
          conn.end();
        });        
    });
  });

  server.listen(ssh_serverport, () => {
    console.log(`Socket server ssh running on port ${ssh_serverport}`);
  });
}

startSocketServer();
