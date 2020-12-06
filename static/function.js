let socket = io.connect("http://localhost:3000");

let userlist = document.getElementById("userlist");
let roomlist = document.getElementById("roomlist");
let message = document.getElementById("message");
let messages = document.getElementById("displayMessage");
let chatDisplay = document.getElementById("messageDisplay");

let currentRoom = "Home";

function send() {
  socket.emit("messageSent", message.value);
  message.value = "";
}
function createRoom() {
  socket.emit("createRoom", prompt("Enter new room: "));
}

socket.on("connect", function () {
  socket.emit("createUser", prompt("Enter name: "));
});

socket.on("updateChat", function (username, data) {
  if (username == "USER") {
    messages.innerHTML +=
      "<p>" + data + "</p>";
  } else {
    messages.innerHTML +=
      "<p><span><strong>" + username + ": </strong></span>" + data + "</p>";
  }

  chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

socket.on("updateUsers", function (usernames) {
  userlist.innerHTML = "";

  for (var user in usernames) {
    userlist.innerHTML += "<li>" + user + "</li>";
  }
});

socket.on("changeRooms", function (rooms) {
  roomlist.innerHTML = "";

  for (var index in rooms) {
    roomlist.innerHTML +=
      '<li class="rooms" id="' +
      rooms[index] +
      '" onclick="changeRoom(\'' +
      rooms[index] +
      "')\"> " +
      rooms[index] +
      "</li>";
  }
});

function changeRoom(room) {
  if (room != currentRoom) {
    socket.emit("changeRooms", room);
    currentRoom = room;
  }
}
