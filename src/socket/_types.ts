interface ServerToClientEvents {

  hello: (msg: string) => void;

  basicEmit: (a: number, b: string, c: Buffer) => void;

  withAck: (d: string, callback: (e: number) => void) => void;

}

interface ClientToServerEvents {

  hello: (msg: string) => void;

}

interface InterServerEvents {

  ping: () => void;

}

interface SocketData {

  _id: string;

  name: string;

  authenticated: boolean

}
