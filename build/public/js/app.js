"use strict";

var socket = io();
var welcome = document.getElementById("welcome");
var room = document.getElementById("room");
room.hidden = true;
var form = document.querySelector("form");
var roomName;

var handleMessageSubmit = function handleMessageSubmit(event) {
  event.preventDefault();
  var input = room.querySelector("#msg input");
  var value = input.value;
  socket.emit("new_message", input.value, roomName, function () {
    addMessage("You: ".concat(value));
  });
  input.value = "";
};

var handleNameSubmit = function handleNameSubmit(event) {
  event.preventDefault();
  var input = room.querySelector("#name input");
  var value = input.value;
  socket.emit("nickname", input.value);
};

var showRoom = function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName);
  var mesForm = room.querySelector("#msg");
  var nameForm = room.querySelector("#name");
  mesForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNameSubmit);
};

var addMessage = function addMessage(message) {
  var ul = room.querySelector("ul");
  var li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

var handleSubmit = function handleSubmit(event) {
  event.preventDefault();
  console.log(socket);
  var input = form.querySelector("input");
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
};

form.addEventListener("submit", handleSubmit);
socket.on("welcome", function (user, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(user, " joined!"));
});
socket.on("bye", function (user, newCount) {
  var h3 = room.querySelector("h3");
  h3.innerText = "Room ".concat(roomName, " (").concat(newCount, ")");
  addMessage("".concat(user, " left!"));
});
socket.on("new_message", addMessage);
socket.on("room_change", function (rooms) {
  var roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";

  if (rooms.length === 0) {
    return;
  }

  rooms.forEach(function (room) {
    var li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});