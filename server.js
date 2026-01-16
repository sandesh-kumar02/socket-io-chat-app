import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {},
});
const onlineUser = {};

const __dirname = dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
    // user remove
    delete onlineUser[socket.id];
    // updated list sabko bhejo
    io.emit("online user", Object.values(onlineUser));
  });
  socket.on("set nickname", (nickname) => {
    socket.nickname = nickname;
    // user add
    onlineUser[socket.id] = nickname;
    // send updated list
    io.emit("online user", Object.values(onlineUser));
    console.log("online user:", onlineUser);
  });

  socket.on("chat message", (msg) => {
    socket.broadcast.emit("chat message", {
      nickname: socket.nickname,
      message: msg,
    });
  });
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.nickname);
  });

  socket.on("stop typing", () => {
    socket.broadcast.emit("stop typing");
  });
});

server.listen(3000, () => {
  console.log("server running at 3000 port no.");
});
