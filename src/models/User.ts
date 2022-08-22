import mongoose from 'mongoose'

import validator from 'validator'

import bcryptjs from 'bcryptjs'

import jsonwebtoken from 'jsonwebtoken'

import { v4 } from 'uuid'

import sendMail from '../mail/sendMail'

import { welcomeMail, exitMail } from '../mail/mailTypes'


const siteName: any = process.env.SITE_NAME

const host: any = process.env.HOST

const jwtSecret: any = process.env.JWT_SECRET

// Sets up user schema
const userSchema = new mongoose.Schema({

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

    validate(value: string) {

      if (!validator.isEmail(value)) {

        throw new Error('Email is invalid')

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

    default: v4()

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


// Generate Authentication Token
userSchema.methods.generateAuthToken = async function (): Promise<string> {

  const user = this

  const token = jsonwebtoken.sign({ _id: user.id.toString() }, jwtSecret, {})

  user.tokens.push({ token })

  await user.save()

  return token

}


// Private profile
userSchema.methods.toJSON = function (): JSON {

  const user = this

  const returnUser = user.toObject()

  returnUser.verify = returnUser.verify === "true"

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  return returnUser

}


// Public profile
userSchema.methods.toPublicJSON = function (): JSON {

  const user = this

  const returnUser = user.toObject()

  returnUser.verify = returnUser.verify === "true"

  delete returnUser.password

  delete returnUser.tokens

  delete returnUser.avatar

  delete returnUser.theme

  delete returnUser.fontSize

  delete returnUser.sendWithEnter

  return returnUser

}


// send verification mail
userSchema.methods.sendVerificationEmail = async function (): Promise<Object> {

  const user = this

  const mailBody = welcomeMail(siteName, `${host}/mail/welcome-mail/${user._id}/${user.verify}`)

  try {

    const mail = await sendMail(user.email, `Welcome to ${siteName}`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// send verification mail
userSchema.methods.sendExitEmail = async function (): Promise<Object> {

  const user = this

  const mailBody = exitMail(siteName, `${host}/complain`)

  try {

    const mail = await sendMail(user.email, `Goodbye ${user.name}`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// For login
userSchema.statics.findbyCredentials = async (email, password) => {

  const user = await User.findOne({ email }, { avatar: 0, avatarSmall: 0 })

  if (!user) throw new Error('Unable to login')

  const isMatch = await bcryptjs.compare(password, user.password)

  if (!isMatch) throw new Error('Unable to login')

  return user

}


// Hash password
userSchema.pre('save', async function (next) {

  const user = this

  if (user.isModified('password')) user.password = await bcryptjs.hash(user.password, 8)

  next()

})


// Create User Model
const User = mongoose.model('User', userSchema)


export default User
