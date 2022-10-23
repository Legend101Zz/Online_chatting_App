const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { ExpressPeerServer, PeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userId) => {
    socket.join(roomid);
    io.sockets.in(roomid).emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomid).emit("createMessage", message);
    });
    socket.on("disconnect", () => {
      io.sockets.in(roomid).emit("user-disconnected", userId);
    });
  });
});

server.listen(process.env.PORT || 3030);
