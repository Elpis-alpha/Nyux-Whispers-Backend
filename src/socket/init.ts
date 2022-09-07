import { Server } from "socket.io";
import { getUserFromToken } from "./helpers";


const init = async (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {

  io.on('connection', async (socket) => {

    socket.data.authenticated = false

    const token = socket.handshake.auth.token

    const user = await getUserFromToken(token)

    if (user) {

      socket.data.authenticated = true

      socket.data._id = user._id

      socket.data.name = user.uniqueName

      console.log(`User ${socket.data.name} has entered the website`);

    } else {

      console.log('a user has entered the website');

    }


    socket.on('disconnect', () => {

      console.log('a user has left the website');

    });

    socket.on('hello', (msg) => {

      io.emit("hello", msg)

      console.log(socket.id);

      console.log('Msg:', msg);

    });

  });

}

export default init