"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    ownerID: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
    },
    reference: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: false,
    },
    messageType: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ["Text", "Image"],
            message: `{VALUE} is not supported`
        },
    },
    text: {
        type: String,
        trim: true,
    },
    image: {
        required: false,
        available: {
            type: Boolean,
            required: true,
            default: false
        },
        normal: {
            type: Buffer
        },
        small: {
            type: Buffer
        },
    },
}, { timestamps: true });
exports.default = messageSchema;
