import express, { Router } from 'express';

import multer from 'multer';

import { v4 } from 'uuid';

import auth from '../middleware/auth';

import { errorJson } from '../middleware/errors';

import Conversation from '../models/Conversation';

import { MyConversation, MyUser } from '../models/_types';



const router: Router = express.Router()



// Sends post request to create new conversation
router.post('/api/conversation/create', auth, async (req, res) => {

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

    const conversation: MyConversation = new Conversation({

      owners: [

        req.body.owners.map((id: string, index: number) => {

          return {

            ownerID: id,

            dateJoined: JSON.stringify(new Date()),

            isAdmin: index === 0,

            lastChecked: JSON.stringify(new Date())

          }

        })

      ],

      messages: [],

      isGroup: false,

    })

    await conversation.save()

    res.status(201).send(conversation)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to create new group
router.post('/api/conversation/create-group', auth, async (req, res) => {

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

    const conversation: MyConversation = new Conversation({

      owners: [

        req.body.owners.map((id: string, index: number) => {

          return {

            ownerID: id,

            dateJoined: JSON.stringify(new Date()),

            isAdmin: index === 0,

            lastChecked: JSON.stringify(new Date())

          }

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

      roomKey: v4()

    })

    await conversation.save()

    res.status(201).send(conversation)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends get request to reterieve all user conversations
router.get('/api/conversation/get-all', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    // @ts-ignore
    const conversations = await Conversation.findUserConversations(user._id)

    res.send(conversations)

  } catch (error) {

    return errorJson(res, 500)

  }

})




const upload = multer({

  limits: { fileSize: 200 * (10 ** 6) }, // 200 mb

  fileFilter(req, file, cb) {

    if (!file.originalname.match(/\.(mp4|mkv|webm)$/)) cb(new Error('Please upload an image'))

    cb(null, true)

  }

})


router.post('/api/whatever', upload.single('webcam'), async (req, res) => {

  try {

    if (!req.file) throw new Error("The data must have a webcam attribute");

    const webCamBuffer = req.file.buffer

    res.send({ webCamBuffer })

  } catch (error) {

    res.status(400).send({ error })

  }

  // @ts-ignore
}, (error, req, res, next) => res.status(400).send({ error }))


export default router

