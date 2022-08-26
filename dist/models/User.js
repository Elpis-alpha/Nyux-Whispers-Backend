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
const validator_1 = __importDefault(require("validator"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const sendMail_1 = __importDefault(require("../mail/sendMail"));
const mailTypes_1 = require("../mail/mailTypes");
const siteName = process.env.SITE_NAME;
const host = process.env.HOST;
const jwtSecret = process.env.JWT_SECRET;
// Sets up user schema
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    uniqueName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator_1.default.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    lastOnline: {
        type: String,
        required: true,
        trim: true,
        // When websocket begins, lastOnline = "online"
        // When websocket ends, lastOnline = "date string"
    },
    theme: {
        type: String,
        required: true,
        trim: true,
        enum: {
            values: ["Light", "Dark", "Auto"],
            message: `{VALUE} is not supported`
        },
    },
    fontSize: {
        type: String,
        required: true,
        trim: true,
        enum: {
            // 0.8rem 1rem 1.2rem
            values: ["Small", "Normal", "Large"],
            message: `{VALUE} is not supported`
        },
    },
    biography: {
        type: String,
    },
    phoneNumber: {
        type: String,
    },
    sendWithEnter: {
        type: Boolean,
        required: true,
        default: false
    },
    verify: {
        type: String,
        trim: true,
        default: (0, uuid_1.v4)()
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    avatar: {
        normal: {
            type: Buffer
        },
        small: {
            type: Buffer
        },
    }
}, { timestamps: true });
// Change User UniqueName
userSchema.methods.changeUniqueName = function (name) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = this;
        try {
            user.uniqueName = name;
            yield user.save();
            return user;
        }
        catch (error) {
            return { error: 'Duplicate Name' };
        }
    });
};
// Change User Email
userSchema.methods.changeEmail = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = this;
        try {
            user.email = email;
            yield user.save();
            return user;
        }
        catch (error) {
            return { error: 'Duplicate Email' };
        }
    });
};
// Change User Last Online
userSchema.methods.changeLastOnline = function (online) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore
        const user = this;
        try {
            if (online) {
                user.lastOnline = online;
            }
            else {
                user.lastOnline = JSON.stringify(new Date());
            }
            yield user.save();
            return user;
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// Generate Authentication Token
userSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const token = jsonwebtoken_1.default.sign({ _id: user.id.toString() }, jwtSecret, {});
        user.tokens.push({ token });
        yield user.save();
        return token;
    });
};
// Private profile
userSchema.methods.toJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    returnUser.verify = returnUser.verify === "true";
    delete returnUser.password;
    delete returnUser.tokens;
    delete returnUser.avatar;
    return returnUser;
};
// Public profile
userSchema.methods.toPublicJSON = function () {
    const user = this;
    const returnUser = user.toObject();
    returnUser.verify = returnUser.verify === "true";
    delete returnUser.password;
    delete returnUser.tokens;
    delete returnUser.avatar;
    delete returnUser.theme;
    delete returnUser.fontSize;
    delete returnUser.sendWithEnter;
    return returnUser;
};
// send verification mail
userSchema.methods.sendVerificationEmail = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const mailBody = (0, mailTypes_1.welcomeMail)(siteName, `${host}/mail/welcome-mail/${user._id}/${user.verify}`);
        try {
            const mail = yield (0, sendMail_1.default)(user.email, `Welcome to ${siteName}`, mailBody);
            // @ts-ignore
            if (mail.error)
                return { error: 'Server Error' };
            return { message: 'email sent' };
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// send verification mail
userSchema.methods.sendExitEmail = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        const mailBody = (0, mailTypes_1.exitMail)(siteName, `${host}/complain`);
        try {
            const mail = yield (0, sendMail_1.default)(user.email, `Goodbye ${user.name}`, mailBody);
            // @ts-ignore
            if (mail.error)
                return { error: 'Server Error' };
            return { message: 'email sent' };
        }
        catch (error) {
            return { error: 'Server Error' };
        }
    });
};
// For login
userSchema.statics.findbyCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email }, { avatar: 0, avatarSmall: 0 });
    if (!user)
        throw new Error('Unable to login');
    const isMatch = yield bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        throw new Error('Unable to login');
    return user;
});
// Hash password
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = this;
        if (user.isModified('password'))
            user.password = yield bcryptjs_1.default.hash(user.password, 8);
        next();
    });
});
// Create User Model
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
