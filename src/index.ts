import https from 'https';


// Import Statements
import './middleware/init';

import './db/mongoose';

import hbs from 'hbs';

import http from 'http';

import path from 'path';

import express, { Express } from 'express';

import { Server } from 'socket.io';

import chalk from 'chalk';

import cors from 'cors';

import initSocket from './socket/init';

import delay from './middleware/delay';

import userRouter from './routers/user';

import _404Router from './routers/404';

import normalRouter from './routers/normal';

import conversationRouter from './routers/conversation';


// Acquires the port on which the application runs
const frontEndLocation = process.env.FRONT_END_LOCATION


// Acquires the port on which the application runs
const port = process.env.PORT


// Reterieves the application production status
const isProduction = process.env.IS_PRODUCTION === 'true'


// Reterieves the application http prefered information
const useHttps = process.env.USE_HTTPS === 'true'


// Acquire an instance of Express
const app: Express = express();


// Create an instance of a http server 
const server = (useHttps ? https : http).createServer(app)


// Create the io server instance
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {

  cors: {

    origin: frontEndLocation,

    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'

  }

})


// Obtain the public path
const publicPath = path.join(__dirname, '../public')


// Obtain the views path
const viewsPath = path.join(__dirname, '../template/views')


// Obtain the partials path
const partialsPath = path.join(__dirname, '../template/partials')


// Sets the view engine to HBS
app.set('view engine', 'hbs')


// Automatically serve view hbs files
app.set('views', viewsPath)


// Automatically serve partials as hbs files
hbs.registerPartials(partialsPath)


// Automatically serve public (static) files
app.use(express.static(publicPath))


// Automatically parse incoming requests and 20mb limit
app.use(express.json({ limit: "20mb" }))


// Automatically parse form body and encodes
app.use(express.urlencoded({ extended: true }))


// Automatically allow incomming incoming cors
app.use(cors())


// One second delay for local development
if (!isProduction) { app.use(delay) }


// Start Socket Configuration
initSocket(io)


// Automatically allows user routers
app.use(userRouter)


// Automatically allows normal routes
app.use(normalRouter)


// Automatically allows conversation routes
app.use(conversationRouter)


// Automatically allows 404 routes
app.use(_404Router)


// Listening Server
server.listen(port, () => {

  console.log(chalk.hex('#009e00')(`Server started successfully on port ${port}`));

  console.log(chalk.cyanBright(`Server time: ${new Date().toLocaleString()}`));

})
