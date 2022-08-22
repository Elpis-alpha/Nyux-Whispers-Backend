import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({

  ownerID: {

    type: mongoose.Schema.Types.ObjectId,

    required: true,

  },

  reference: {// Message Reference

    type: mongoose.Schema.Types.ObjectId,

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

}, { timestamps: true })

// Message Model
const Message = mongoose.model('Message', messageSchema)

export default Message
