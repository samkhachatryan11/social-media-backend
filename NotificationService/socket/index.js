module.exports = (socket) => {
  console.log("New user connected for notifications:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room.`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected from notifications:", socket.id);
  });
};
