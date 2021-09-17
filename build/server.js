"use strict";

var _http = _interopRequireDefault(require("http"));

var _socket = require("socket.io");

var _express = _interopRequireDefault(require("express"));

var _adminUi = require("@socket.io/admin-ui");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var app = (0, _express["default"])(); // app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));

app.get("/", function (req, res) {
  return res.send("This is chat server");
});
app.get("/*", function (req, res) {
  return res.redirect("/");
});

var handleListen = function handleListen() {
  console.log("5000 port Connected");
};

var httpServer = _http["default"].createServer(app);

var wsServer = new _socket.Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  }
});
(0, _adminUi.instrument)(wsServer, {
  auth: false
});

var getPublicRooms = function getPublicRooms() {
  var _wsServer$sockets$ada = wsServer.sockets.adapter,
      sids = _wsServer$sockets$ada.sids,
      rooms = _wsServer$sockets$ada.rooms;
  var publicRooms = [];
  rooms.forEach(function (_, key) {
    sids.get(key) === undefined && publicRooms.push(key);
  });
  return publicRooms;
};

var countRoom = function countRoom(roomName) {
  var _wsServer$sockets$ada2;

  return (_wsServer$sockets$ada2 = wsServer.sockets.adapter.rooms.get(roomName)) === null || _wsServer$sockets$ada2 === void 0 ? void 0 : _wsServer$sockets$ada2.size;
};

wsServer.on("connection", function (socket) {
  socket["nickname"] = "Anon";
  socket.onAny(function (event) {
    console.log(wsServer.sockets.adapter);
    console.log("Socket Event : ".concat(event));
  });
  wsServer.sockets.emit("room_change", getPublicRooms());
  socket.on("enter_room", function (roomName, done) {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("disconnecting", function () {
    socket.rooms.forEach(function (room) {
      return socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1);
    });
  });
  socket.on("disconnect", function () {
    wsServer.sockets.emit("room_change", getPublicRooms());
  });
  socket.on("new_message", function (msg, room, done) {
    socket.to(room).emit("new_message", "".concat(socket.nickname, ": ").concat(msg));
    done();
  });
  socket.on("nickname", function (nickname) {
    return socket["nickname"] = nickname;
  });
});
httpServer.listen(process.env.PORT || 5000, handleListen);