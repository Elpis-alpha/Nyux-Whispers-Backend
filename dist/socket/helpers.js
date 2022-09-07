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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserFromToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const getUserFromToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token)
        return false;
    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
    if (typeof decoded === "string")
        return false;
    const user = yield User_1.default.findOne({ _id: decoded._id, 'tokens.token': token }, { avatar: 0 });
    if (!user)
        return false;
    return user;
});
exports.getUserFromToken = getUserFromToken;
