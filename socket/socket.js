module.exports = function (io, rooms) {
  const chatrooms = io.of('/roomlist').on('connection', (socket) => {
    console.log("connections works on server");
    // emit to send rooms when user refreshes page
    socket.emit('room_update', JSON.stringify(rooms));

    socket.on('new_room', (data) => {
      rooms.push(data);
      // broadcast to all the users a new list of chat rooms
      socket.broadcast.emit('room_update', JSON.stringify(rooms));
      // this will not send it to user, who just created new room
      // so we have to emit the event to him
      socket.emit('room_update', JSON.stringify(rooms));
    });
  })


};