import { Server } from "socket.io";

import { DefaultEventsMap } from "socket.io/dist/typed-events";


const init = async (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {

  io.on('connection', (socket) => {

    console.log('a user has entered the website');

    socket.on('disconnect', () => {

      console.log('a user has left the website');

    });

  });

}

export default init