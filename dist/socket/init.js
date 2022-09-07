"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./helpers");
const init = (io) => __awaiter(void 0, void 0, void 0, function* () {
    io.on('connection', (socket) => __awaiter(void 0, void 0, void 0, function* () {
        socket.data.authenticated = false;
        const token = socket.handshake.auth.token;
        const user = yield (0, helpers_1.getUserFromToken)(token);
        if (user) {
            socket.data.authenticated = true;
            socket.data._id = user._id;
            socket.data.name = user.uniqueName;
            console.log(`User ${socket.data.name} has entered the website`);
        }
        else {
            console.log('a user has entered the website');
        }
        socket.on('disconnect', () => {
            console.log('a user has left the website');
        });
        socket.on('hello', (msg) => {
            io.emit("hello", msg);
            console.log(socket.id);
            console.log('Msg:', msg);
        });
    }));
});
exports.default = init;
