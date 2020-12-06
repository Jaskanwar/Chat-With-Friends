const express = require("express");
const socketio = require("socket.io");
const app = express();
const port = 3000;
const readline = require("readline");
app.use(express.static("static"));

let server = app.listen(port, () => {
  console.log("Listening on port " + port);
});

const io = socketio(server);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let users = {};
let chatRooms = ["Home"];

io.on("connection", function (socket) {
  socket.on("createUser", function (name) {
    socket.name = name;
    users[name] = name;
    socket.currentRoom = "Home";
    socket.join("Home");
    socket.emit("updateChat", "USER", "Joined Home");
    socket.broadcast
      .to("Home")
      .emit("updateChat", "USER", name + " joined chat.");
    io.sockets.emit("updateUsers", users);
    socket.emit("changeRooms", chatRooms, "Home");
  });

  socket.on("messageSent", function (data) {
    io.sockets.to(socket.currentRoom).emit("updateChat", socket.name, data);
  });

  socket.on("createRoom", function (chatRoom) {
    if (chatRoom != null) {
      chatRooms.push(chatRoom);
      io.sockets.emit("changeRooms", chatRooms);
    }
  });
  socket.on("changeRooms", function (chatRoom) {
    socket.broadcast
      .to(socket.currentRoom)
      .emit("updateChat", "USER", socket.name + " left this room.");
    socket.leave(socket.currentRoom);
    socket.currentRoom = chatRoom;
    socket.join(chatRoom);
    socket.emit("updateChat", "USER", "Joined " + chatRoom);
    socket.broadcast
      .to(chatRoom)
      .emit("updateChat", "USER", socket.name + " joined the chat!");
  });

  socket.on("disconnect", function () {
    delete users[socket.name];
    io.sockets.emit("updateUsers", users);
    socket.broadcast.emit("updateChat", "USER", socket.name + " went bye bye!");
    socket.leave(socket.currentRoom);
  });

  function notifyClient() {
    socket.broadcast.emit("updateChat", "USER", "Server shutdown");
  }

  rl.question("Enter done to close server ", function (input) {
    if (input == "done") {
      notifyClient();
      process.kill(process.pid);
    }
  });
});
