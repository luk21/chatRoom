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
  });

  const messages = io.of('/messages').on('connection', (socket) => {
    console.log("connected to the chatroom");

    socket.on('join_room', (data) => {
      console.log("joining", data);
      socket.user_name = data.user_name;
      socket.join(data.room_number, () => {
        updateUserList(data.room_number, true);
      });
    });

    socket.on('new_message', (data) => {
      console.log("logging", data);
      socket.broadcast.to(data.room_number).emit('message_feed', JSON.stringify(data));
    });

    function updateUserList(room_number, updateAll) {
      var getUsers = io.of('/messages').in(room_number).clients((error, clients) => {
        if (error) throw error;

        let userList = [];

        for (let clientId of clients) {
          let user = getUsers.connected[clientId]; // get socket object
          userList.push({user_name: user.user_name});
        }

        socket.emit('update_user_list', JSON.stringify(userList));

        if(updateAll){
          socket.broadcast.to(room_number).emit('update_user_list', JSON.stringify(userList));
        }

      });
    }

    socket.on('update_user_list_client', (data) => {
      updateUserList(data.room_number);
    })
  });
};