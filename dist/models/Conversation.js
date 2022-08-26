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
const mongoose_1 = __importDefault(require("mongoose"));
const uuid_1 = require("uuid");
const Message_1 = __importDefault(require("./Message"));
const conversationSchema = new mongoose_1.default.Schema({
    owners: [
        {
            ownerID: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                required: true,
            },
            dateJoined: {
                type: String,
                required: true,
                trim: true,
            },
            isAdmin: {
                type: Boolean,
                required: true,
                default: false
            },
            lastChecked: {
                type: String,
                required: true,
                trim: true,
            }
        }
    ],
    messages: [
        Message_1.default
    ],
    groupImage: {
        normal: {
            type: Buffer,
        },
        small: {
            type: Buffer
        },
    },
    isGroup: {
        type: Boolean,
        required: true,
    },
    groupName: {
        type: String,
        trim: true,
    },
    groupDescription: {
        type: String,
        trim: true,
    },
    roomKey: {
        type: String,
        required: true,
        trim: true,
        default: (0, uuid_1.v4)()
    }
}, { timestamps: true });
// Private profile
conversationSchema.methods.toJSON = function () {
    const conversation = this;
    const returnConversation = conversation.toObject();
    delete returnConversation.roomKey;
    return returnConversation;
};
// Find all the user conversations
conversationSchema.statics.findUserConversations = (userID) => __awaiter(void 0, void 0, void 0, function* () {
    const conversations = yield Conversation.find({
        owners: {
            ownerID: userID
        }
    });
    return conversations;
});
// add group member
conversationSchema.methods.addGroupMember = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (conversation.isGroup) {
                // Remove the user if he already exists
                conversation.owners = conversation.owners.filter(owner => owner.ownerID !== user._id);
                conversation.owners.push({
                    ownerID: user._id,
                    dateJoined: JSON.stringify(new Date()),
                    isAdmin: false,
                    lastChecked: JSON.stringify(new Date())
                });
                yield conversation.save();
                return { conversation, message: "added" };
            }
            else {
                return { error: "not-group" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// remove group member
conversationSchema.methods.removeGroupMember = function (user) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (conversation.isGroup) {
                // Remove the user
                conversation.owners = conversation.owners.filter(owner => owner.ownerID !== user._id);
                yield conversation.save();
                return { conversation, message: "removed" };
            }
            else {
                return { error: "not-group" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// change group name
conversationSchema.methods.setGroupName = function (newName) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (conversation.isGroup) {
                conversation.groupName = newName;
                yield conversation.save();
                return { conversation, message: "saved" };
            }
            else {
                return { error: "not-group" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// change group image
conversationSchema.methods.setGroupImage = function (small, normal) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (conversation.isGroup) {
                conversation.groupImage.small = small;
                conversation.groupImage.normal = normal;
                yield conversation.save();
                return { conversation, message: "saved" };
            }
            else {
                return { error: "not-group" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// send a new text message
conversationSchema.methods.sendTextMessage = function (message) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (message.messageType === "Text" && !message.image) {
                conversation.messages.push(message);
                yield conversation.save();
                return { conversation, message: "saved" };
            }
            else {
                return { error: "not-text" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// send a new image message
conversationSchema.methods.sendImageMessage = function (message) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            if (message.messageType === "Image" && message.image.available) {
                conversation.messages.push(message);
                yield conversation.save();
                return { conversation, message: "saved" };
            }
            else {
                return { error: "not-image" };
            }
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// update text message
conversationSchema.methods.updateTextMessage = function (messageID, newText) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        let foundMessage = "not_found";
        try {
            conversation.messages.forEach(message => {
                if (message._id === messageID && message.messageType === "Text") {
                    message.text = newText;
                    foundMessage = "found";
                }
            });
            yield conversation.save();
            return { conversation, message: foundMessage };
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// delete message
conversationSchema.methods.deleteMessage = function (messageID) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const conversation = this;
        try {
            const oldMessagesLength = conversation.messages.length;
            conversation.messages = conversation.messages.filter(message => message._id !== messageID);
            const newMessagesLength = conversation.messages.length;
            const foundMessage = oldMessagesLength === newMessagesLength ? "not_found" : "found";
            yield conversation.save();
            return { conversation, message: foundMessage };
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// Conversation Model
const Conversation = mongoose_1.default.model('Conversation', conversationSchema);
exports.default = Conversation;
