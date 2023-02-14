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
const sendMail_1 = __importDefault(require("../mail/sendMail"));
const mailTypes_1 = require("../mail/mailTypes");
const SpecialCtrl_1 = require("../helpers/SpecialCtrl");
const siteName = process.env.SITE_NAME;
const host = process.env.HOST;
// Sets up preUser schema
const preUserSchema = new mongoose_1.default.Schema({
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
    verified: {
        type: Boolean,
        default: false,
        required: true
    },
    emailCode: [
        {
            verifyCode: {
                type: String,
                required: true
            }
        }
    ],
}, { timestamps: true });
// send verification mail
preUserSchema.methods.sendVerificationEmail = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const preUser = this;
        const verifyCode = (0, SpecialCtrl_1.randomAmong)(100000, 900000).toString();
        preUser.emailCode.push({ verifyCode });
        yield preUser.save();
        const mailBody = (0, mailTypes_1.verifyEmailMail)(siteName, `${host}/complain`, verifyCode);
        try {
            const mail = yield (0, sendMail_1.default)(preUser.email, `Verify Your Nyux Account`, mailBody);
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
// Create PreUser Model
const PreUser = mongoose_1.default.model('PreUser', preUserSchema);
exports.default = PreUser;
