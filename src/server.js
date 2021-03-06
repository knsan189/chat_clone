import http from "http";
import { Server } from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";
import cookieParser from "cookie-parser";

const app = express();
app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.use(
  cookieParser(process.env.COOKIE_SECRET, { sameSite: "none", secure: true })
);

app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => {
  console.log("5000 port Connected");
};
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

instrument(wsServer, {
  auth: false,
});

const getPublicRooms = () => {
  const { sids, rooms } = wsServer.sockets.adapter;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    sids.get(key) === undefined && publicRooms.push(key);
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log(wsServer.sockets.adapter);
    console.log(`Socket Event : ${event}`);
  });

  wsServer.sockets.emit("room_change", getPublicRooms());

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
    wsServer.sockets.emit("room_change", getPublicRooms());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", getPublicRooms());
  });

  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));

  socket.on("moveMapPosition", ({ center, zoom, room }) => {
    console.log(center, zoom);
    socket.broadcast.to(room).emit("moveMapPosition", { center, zoom });
  });

  socket.on("changePlans", ({ plans, room }) => {
    console.log(plans);
    socket.broadcast.to(room).emit("changePlans", plans);
  });
});

httpServer.listen(process.env.PORT || 5000, handleListen);
