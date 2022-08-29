"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
// Import Statements
require("./middleware/init");
require("./db/mongoose");
const hbs_1 = __importDefault(require("hbs"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const socket_io_1 = require("socket.io");
const chalk_1 = __importDefault(require("chalk"));
const cors_1 = __importDefault(require("cors"));
const init_1 = __importDefault(require("./socket/init"));
const delay_1 = __importDefault(require("./middleware/delay"));
const user_1 = __importDefault(require("./routers/user"));
const _404_1 = __importDefault(require("./routers/404"));
const normal_1 = __importDefault(require("./routers/normal"));
const conversation_1 = __importDefault(require("./routers/conversation"));
// Acquires the port on which the application runs
const frontEndLocation = process.env.FRONT_END_LOCATION;
// Acquires the port on which the application runs
const port = process.env.PORT;
// Reterieves the application production status
const isProduction = process.env.IS_PRODUCTION === 'true';
// Reterieves the application http prefered information
const useHttps = process.env.USE_HTTPS === 'true';
// Acquire an instance of Express
const app = (0, express_1.default)();
// Create an instance of a http server 
const server = (useHttps ? https_1.default : http_1.default).createServer(app);
// Create the io server instance
const io = new socket_io_1.Server(server, {
    cors: {
        origin: frontEndLocation,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE'
    }
});
// Obtain the public path
const publicPath = path_1.default.join(__dirname, '../public');
// Obtain the views path
const viewsPath = path_1.default.join(__dirname, '../template/views');
// Obtain the partials path
const partialsPath = path_1.default.join(__dirname, '../template/partials');
// Sets the view engine to HBS
app.set('view engine', 'hbs');
// Automatically serve view hbs files
app.set('views', viewsPath);
// Automatically serve partials as hbs files
hbs_1.default.registerPartials(partialsPath);
// Automatically serve public (static) files
app.use(express_1.default.static(publicPath));
// Automatically parse incoming requests and 20mb limit
app.use(express_1.default.json({ limit: "20mb" }));
// Automatically parse form body and encodes
app.use(express_1.default.urlencoded({ extended: true }));
// Automatically allow incomming incoming cors
app.use((0, cors_1.default)());
// One second delay for local development
if (!isProduction) {
    app.use(delay_1.default);
}
// Start Socket Configuration
(0, init_1.default)(io);
// Automatically allows user routers
app.use(user_1.default);
// Automatically allows normal routes
app.use(normal_1.default);
// Automatically allows conversation routes
app.use(conversation_1.default);
// Automatically allows 404 routes
app.use(_404_1.default);
// Listening Server
server.listen(port, () => {
    console.log(chalk_1.default.hex('#009e00')(`Server started successfully on port ${port}`));
    console.log(chalk_1.default.cyanBright(`Server time: ${new Date().toLocaleString()}`));
});
