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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const uuid_1 = require("uuid");
const auth_1 = __importDefault(require("../middleware/auth"));
const errors_1 = require("../middleware/errors");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const router = express_1.default.Router();
// Sends post request to create new conversation
router.post('/api/conversation/create', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    // const user: MyUser = req.user
    /*
  
      req.body = {
  
        owners: [
  
          'id_1',
  
          'id_2',
  
          'id_3',
  
        ]
  
      }
  
    */
    try {
        const conversation = new Conversation_1.default({
            owners: [
                req.body.owners.map((id, index) => {
                    return {
                        ownerID: id,
                        dateJoined: JSON.stringify(new Date()),
                        isAdmin: index === 0,
                        lastChecked: JSON.stringify(new Date())
                    };
                })
            ],
            messages: [],
            isGroup: false,
        });
        yield conversation.save();
        res.status(201).send(conversation);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends post request to create new group
router.post('/api/conversation/create-group', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    /*
    
      req.body = {
    
        owners: [
    
          'id_1',
    
          'id_2',
    
          'id_3',
    
        ],
    
        description: "",
    
        name: ""
    
      }
    
    */
    // @ts-ignore
    // const user: MyUser = req.user
    try {
        const conversation = new Conversation_1.default({
            owners: [
                req.body.owners.map((id, index) => {
                    return {
                        ownerID: id,
                        dateJoined: JSON.stringify(new Date()),
                        isAdmin: index === 0,
                        lastChecked: JSON.stringify(new Date())
                    };
                })
            ],
            messages: [],
            isGroup: true,
            groupImage: {
                normal: undefined,
                small: undefined
            },
            groupDescription: req.body.description,
            groupName: req.body.name,
            roomKey: (0, uuid_1.v4)()
        });
        yield conversation.save();
        res.status(201).send(conversation);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 400);
    }
}));
// Sends get request to reterieve all user conversations
router.get('/api/conversation/get-all', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const user = req.user;
    try {
        // @ts-ignore
        const conversations = yield Conversation_1.default.findUserConversations(user._id);
        res.send(conversations);
    }
    catch (error) {
        return (0, errors_1.errorJson)(res, 500);
    }
}));
const upload = (0, multer_1.default)({
    limits: { fileSize: 200 * (10 ** 6) },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(mp4|mkv|webm)$/))
            cb(new Error('Please upload an image'));
        cb(null, true);
    }
});
router.post('/api/whatever', upload.single('webcam'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            throw new Error("The data must have a webcam attribute");
        const webCamBuffer = req.file.buffer;
        res.send({ webCamBuffer });
    }
    catch (error) {
        res.status(400).send({ error });
    }
    // @ts-ignore
}), (error, req, res, next) => res.status(400).send({ error }));
exports.default = router;
