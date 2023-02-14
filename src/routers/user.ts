import express, { Router } from 'express';

import multer from 'multer'

import sharp from 'sharp'

import User from '../models/User'

import auth from '../middleware/auth'

import { errorJson } from '../middleware/errors'

import { MyPreUser, MyUser } from '../models/_types';

import { v4 } from 'uuid';
import { randomAmong } from '../helpers/SpecialCtrl';
import PreUser from '../models/PreUser';



const router: Router = express.Router()

const upload = multer({

  limits: { fileSize: 20000000 },

  fileFilter(req, file, cb) {

    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) cb(new Error('Please upload an image'))

    cb(null, true)

  }

})


// Sends post request to create test user
router.post('/api/pre-user/create', async (req, res) => {

  try {

    // @ts-ignore
    let preUser: MyPreUser | undefined = await PreUser.findOne({ email: req.body.email })

    if (!preUser) {
      preUser = new PreUser({ email: req.body.email })
      await preUser.save()
    }

    const mailInfo = await preUser.sendVerificationEmail()

    res.status(201).send({ email: preUser.email, mailInfo })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to get test user
router.get('/api/pre-user/retreive', async (req, res) => {

  try {

    // @ts-ignore
    const preUser: MyPreUser | undefined = await PreUser.findOne({ email: req.body.email })

    if (!preUser) return errorJson(res, 404, "not a pre-user")

    res.status(201).send({ email: preUser?.email, verified: preUser?.verified })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to test the test user verification status
router.post('/api/pre-user/test', async (req, res) => {

  try {

    // @ts-ignore
    const preUser: MyPreUser | undefined = await PreUser.findOne({ email: req.body.email })

    if (!preUser) return errorJson(res, 404, "not a pre-user")

    if (!preUser.verified) {
      if (preUser.emailCode.map(co => co.verifyCode).includes(req.body.emailCode)) {
        preUser.verified = true;
        await preUser.save()
      }
    }

    res.status(201).send({ email: preUser?.email, verified: preUser?.verified })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to create new user
router.post('/api/users/create', async (req, res) => {

  try {

    // @ts-ignore
    const preUser: MyPreUser | undefined = await PreUser.findOne({ email: req.body.email })

    console.log(preUser)
    if (!preUser) return errorJson(res, 404, "not a pre-user")
    if (!preUser.verified || !preUser.emailCode.map(co => co.verifyCode).includes(req.body.emailCode)) return errorJson(res, 404, "not a valid pre-user")

    const user: MyUser = new User({

      ...req.body,

      lastOnline: JSON.stringify(new Date()),

      fontSize: "Normal",

      biography: "Just another amazing user of Nyux Whispers",

      phoneNumber: "",

      sendWithEnter: false,

      verify: v4()

    })

    await user.save()

    const token = await user.generateAuthToken()

    const verifyUser = await user.sendVerificationEmail()

    res.status(201).send({ user, token, verifyUser })

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends post request to log user in
router.post('/api/users/login', async (req, res) => {

  const { email, uniqueName, password } = req.body

  try {

    // @ts-ignore
    const user: MyUser = await User.findbyCredentials({ email, uniqueName }, password)

    const token = await user.generateAuthToken()

    res.status(200).send({ user, token })

  } catch (error) {

    console.log(error);

    return errorJson(res, 400)

  }

})


// Sends post request to log user out
router.post('/api/users/logout', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  // @ts-ignore
  const token: string = req.token

  const all = req.query.all

  try {

    if (all === "true") {

      user.tokens = []

    } else {

      user.tokens = user.tokens.filter(item => item.token !== token)

    }

    await user.save()

    res.status(200).send({ message: 'Logout Successful' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to fetch auth user
router.get('/api/users/user', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  res.send(user)

})


// sends get request to find a user
router.get('/api/users/find', async (req, res) => {

  const _id = req.query._id

  const email = req.query.email

  const uniqueName = req.query.uniqueName

  try {

    let user: any

    if (typeof _id === "string") {

      user = await User.findById(_id)

      if (!user) return errorJson(res, 404, "User does not exist")

    } else if (typeof email === "string") {

      user = await User.findOne({ email })

      if (!user) return errorJson(res, 404, "User does not exist")

    } else if (typeof uniqueName === "string") {

      user = await User.findOne({ uniqueName })

      if (!user) return errorJson(res, 404, "User does not exist")

    } else {

      return errorJson(res, 400, "Include any of the following as query params: '_id', 'email' or 'uniqueName'")

    }

    res.send(user.toPublicJSON())

  } catch (e) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user name
router.patch('/api/users/change-name', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (!req.body.name) return errorJson(res, 400, "Include 'name' in the req.body for the new name")

    user.name = req.body.name

    await user.save()

    return res.send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user uniqueName
router.patch('/api/users/change-unique-name', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (!req.body.uniqueName) return errorJson(res, 400, "Include 'uniqueName' in the req.body for the new unique name")

    const userr = await user.changeUniqueName(req.body.uniqueName)

    // @ts-ignore
    if (userr.error) return errorJson(res, 403, userr.error)

    return res.send(userr)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user email
router.patch('/api/users/change-email', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (!req.body.email) return errorJson(res, 400, "Include 'email' in the req.body for the new email")

    const userr = await user.changeEmail(req.body.email)

    // @ts-ignore
    if (userr.error) return errorJson(res, 403, userr.error)

    return res.send(userr)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user font size
router.patch('/api/users/change-font-size', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (!req.body.fontSize) return errorJson(res, 400, "Include 'fontSize' in the req.body for the new font size")

    if (!["Small", "Normal", "Large"].includes(req.body.fontSize)) return errorJson(res, 400, "Specified font size is invalid, use: 'Small', 'Normal' or 'Large'")

    user.fontSize = req.body.fontSize

    await user.save()

    return res.send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user biography
router.patch('/api/users/change-biography', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (typeof req.body.biography !== "string") return errorJson(res, 400, "Include 'biography' in the req.body for the new biography")

    user.biography = req.body.biography

    await user.save()

    return res.send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user phone number
router.patch('/api/users/change-phone-number', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (typeof req.body.phoneNumber !== "string") return errorJson(res, 400, "Include 'phoneNumber' in the req.body for the new phone number")

    user.phoneNumber = req.body.phoneNumber

    await user.save()

    return res.send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends patch request to change user send with enter
router.patch('/api/users/change-send-with-enter', auth, async (req, res) => {

  // @ts-ignore
  const user: MyUser = req.user

  try {

    if (typeof req.body.sendWithEnter !== "boolean") return errorJson(res, 400, "Include 'sendWithEnter' in the req.body (as a boolean) for the new send with enter")

    user.sendWithEnter = req.body.sendWithEnter

    await user.save()

    return res.send(user)

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends patch request to change password
router.patch('/api/users/change-password', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    // @ts-ignore
    await User.findbyCredentials({ email: user.email }, req.body.oldPassword)

    user.password = req.body.newPassword

    await user.save()

    res.status(201).send(user)

  } catch (error) {

    return errorJson(res, 400)

  }

})


// Sends delete request to delete users
router.delete('/api/users/delete', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    await user.sendExitEmail()

    await User.deleteOne({ _id: user._id })

    res.send({ message: 'user deleted' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends post request to create and upload the users profile avatar
router.post('/api/users/avatar/upload', auth, upload.single('avatar'), async (req, res) => {

  try {

    // @ts-ignore
    const userF: MyUser = req.user

    // @ts-ignore
    const user: MyUser = await User.findById(userF._id)

    if (!req.file) throw new Error('No File')

    const bufferSmall = await sharp(req.file.buffer).resize({ width: 100 }).png({ quality: 20 }).toBuffer()

    const buffer = await sharp(req.file.buffer).resize({ width: 900 }).png({ quality: 20 }).toBuffer()

    user.avatar.normal = buffer

    user.avatar.small = bufferSmall

    await user.save()

    res.send({ message: 'Image Saved' })

  } catch (error) {

    return errorJson(res, 400)

  }

  // @ts-ignore
}, (error, req, res, next) => errorJson(res, 500))


// Sends delete request to delete the users profile avatar
router.delete('/api/users/avatar/remove', auth, async (req, res) => {

  try {

    // @ts-ignore
    const user: MyUser = req.user

    user.avatar.normal = undefined

    user.avatar.small = undefined

    await user.save()

    res.send({ message: 'avatar removed' })

  } catch (error) {

    return errorJson(res, 500)

  }

})


// Sends get request to render profile avatar
router.get('/api/users/avatar/view', async (req, res) => {

  const _id = req.query._id

  try {

    if (typeof _id !== "string") return errorJson(res, 400, "Include '_id' as a query parameter")

    // @ts-ignore
    const user: MyUser = await User.findById(_id)

    if (!user) return errorJson(res, 400, "Invalid '_id'")

    if (!user.avatar?.normal) return errorJson(res, 400, "User does not have an avatar")

    res.set('Content-Type', 'image/png')

    if (req.query.size === "small") { res.send(user.avatar.small) }

    else { res.send(user.avatar.normal) } // large

  } catch (error) {

    return errorJson(res, 500)

  }

})


// sends get request to check user existence
router.get('/api/users/exists', async (req, res) => {

  const email = req.query.email

  const uniqueName = req.query.uniqueName

  try {

    if (typeof email === "string") {

      const user = await User.findOne({ email })

      if (user === null) { return res.status(200).send({ message: 'user does not exist' }) }

    } else if (typeof uniqueName === "string") {

      const user = await User.findOne({ uniqueName })

      if (user === null) { return res.status(200).send({ message: 'user does not exist' }) }

    }

    res.send({ message: 'user exists' })

  } catch (error) {

    res.status(200).send({ message: 'User does not exist' })

  }

})


// sends get request to get available unique names
router.get('/api/users/look-for-available-unique-names', async (req, res) => {

  let sample = req.query.sample

  try {

    if (typeof sample !== "string") return errorJson(res, 400, "Include a request query called 'sample' in the request")

    sample = sample.trim().replace(/[^a-zA-Z\ \-\_0-9]/g, '').toLowerCase()

    const sampleList = sample.split(" ").slice(0, 2)

    sample = sampleList.join('-')

    let listOfNames = []

    if (sampleList.length === 1) {

      listOfNames.push(sample)

      listOfNames.push(sample + randomAmong(10, 99))
      listOfNames.push(sample + randomAmong(10, 99))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sample + randomAmong(99, 9999))

    } else {

      listOfNames.push(sample)
      listOfNames.push(sampleList[0])
      listOfNames.push(sampleList[1])

      listOfNames.push(sample + randomAmong(10, 99))
      listOfNames.push(sampleList[0] + randomAmong(10, 99))
      listOfNames.push(sampleList[1] + randomAmong(10, 99))

      listOfNames.push(sample + randomAmong(10, 99))
      listOfNames.push(sampleList[0] + randomAmong(10, 99))
      listOfNames.push(sampleList[1] + randomAmong(10, 99))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sampleList[0] + randomAmong(99, 9999))
      listOfNames.push(sampleList[1] + randomAmong(99, 9999))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sampleList[0] + randomAmong(99, 9999))
      listOfNames.push(sampleList[1] + randomAmong(99, 9999))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sampleList[0] + randomAmong(99, 9999))
      listOfNames.push(sampleList[1] + randomAmong(99, 9999))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sampleList[0] + randomAmong(99, 9999))
      listOfNames.push(sampleList[1] + randomAmong(99, 9999))

      listOfNames.push(sample + randomAmong(99, 9999))
      listOfNames.push(sampleList[0] + randomAmong(99, 9999))
      listOfNames.push(sampleList[1] + randomAmong(99, 9999))

    }

    const finalData = await User.find({ uniqueName: { $in: listOfNames } }, { uniqueName: 1, _id: 0 })

    res.send({ sample, sampleList, listOfNames, finalData })

  } catch (error) {

    return errorJson(res, 500)

  }

})


export default router
