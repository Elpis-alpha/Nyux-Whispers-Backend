import mongoose from 'mongoose'
import validator from 'validator'
import sendMail from '../mail/sendMail'
import { verifyEmailMail } from '../mail/mailTypes'
import { MyPreUser } from './_types'
import { randomAmong } from '../helpers/SpecialCtrl';


const siteName: any = process.env.SITE_NAME
const host: any = process.env.HOST

// Sets up preUser schema
const preUserSchema = new mongoose.Schema({

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
preUserSchema.methods.sendVerificationEmail = async function (): Promise<Object> {

  const preUser = this

  const verifyCode = randomAmong(100000, 900000).toString()

  preUser.emailCode.push({ verifyCode })

  await preUser.save()

  const mailBody = verifyEmailMail(siteName, `${host}/complain`, verifyCode)

  try {

    const mail = await sendMail(preUser.email, `Verify Your Nyux Account`, mailBody)

    // @ts-ignore
    if (mail.error) return { error: 'Server Error' }

    return { message: 'email sent' }

  } catch (error) {

    return { error: 'Server Error' }

  }

}

// Create PreUser Model
const PreUser = mongoose.model<MyPreUser>('PreUser', preUserSchema)


export default PreUser
