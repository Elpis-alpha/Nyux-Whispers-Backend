import mongoose from 'mongoose'

import { v4 } from 'uuid'

import Message from './Message'

import { MyConversation, MyMessage, MyUser } from './_types'


const conversationSchema = new mongoose.Schema({

  owners: [

    {

      ownerID: {

        type: mongoose.Schema.Types.ObjectId,

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

    Message

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

    default: v4()

  },

  pinned: {
    
    type: Number,

    required: true,

    default: 0,

    min: 0 // set value to "new Date().getTime()" to pin and 0 to unpin

  }

}, { timestamps: true })




// Private profile
conversationSchema.methods.toJSON = function () {

  const conversation = this

  const returnConversation = conversation.toObject()

  delete returnConversation.roomKey

  return returnConversation

}



// Find all the user conversations
conversationSchema.statics.findUserConversations = async (userID) => {

  const conversations = await Conversation.find({

    owners: {

      ownerID: userID

    }

  })

  return conversations

}


// add group member
conversationSchema.methods.addGroupMember = async function (user: MyUser) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (conversation.isGroup) {

      // Remove the user if he already exists
      conversation.owners = conversation.owners.filter(owner => owner.ownerID !== user._id)

      conversation.owners.push({

        ownerID: user._id,

        dateJoined: JSON.stringify(new Date()),

        isAdmin: false,

        lastChecked: JSON.stringify(new Date())

      })

      await conversation.save()

      return { conversation, message: "added" }

    } else {

      return { error: "not-group" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// remove group member
conversationSchema.methods.removeGroupMember = async function (user: MyUser) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (conversation.isGroup) {

      // Remove the user
      conversation.owners = conversation.owners.filter(owner => owner.ownerID !== user._id)

      await conversation.save()

      return { conversation, message: "removed" }

    } else {

      return { error: "not-group" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// change group name
conversationSchema.methods.setGroupName = async function (newName: string) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (conversation.isGroup) {

      conversation.groupName = newName

      await conversation.save()

      return { conversation, message: "saved" }

    } else {

      return { error: "not-group" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// change group image
conversationSchema.methods.setGroupImage = async function (small: Buffer, normal: Buffer) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (conversation.isGroup) {

      conversation.groupImage.small = small

      conversation.groupImage.normal = normal

      await conversation.save()

      return { conversation, message: "saved" }

    } else {

      return { error: "not-group" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// send a new text message
conversationSchema.methods.sendTextMessage = async function (message: MyMessage) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (message.messageType === "Text" && !message.image) {

      conversation.messages.push(message)

      await conversation.save()

      return { conversation, message: "saved" }

    } else {

      return { error: "not-text" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// send a new image message
conversationSchema.methods.sendImageMessage = async function (message: MyMessage) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    if (message.messageType === "Image" && message.image.available) {

      conversation.messages.push(message)

      await conversation.save()

      return { conversation, message: "saved" }

    } else {

      return { error: "not-image" }

    }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// update text message
conversationSchema.methods.updateTextMessage = async function (messageID: string, newText: string) {

  // @ts-ignore
  const conversation: MyConversation = this

  let foundMessage = "not_found"

  try {

    conversation.messages.forEach(message => {

      if (message._id === messageID && message.messageType === "Text") {

        message.text = newText

        foundMessage = "found"

      }

    })

    await conversation.save()

    return { conversation, message: foundMessage }

  } catch (error) {

    return { error: 'Server Error' }

  }

}


// delete message
conversationSchema.methods.deleteMessage = async function (messageID: string) {

  // @ts-ignore
  const conversation: MyConversation = this

  try {

    const oldMessagesLength = conversation.messages.length

    conversation.messages = conversation.messages.filter(message => message._id !== messageID)

    const newMessagesLength = conversation.messages.length

    const foundMessage = oldMessagesLength === newMessagesLength ? "not_found" : "found"

    await conversation.save()

    return { conversation, message: foundMessage }

  } catch (error) {

    return { error: 'Server Error' }

  }

}



// Conversation Model
const Conversation = mongoose.model<MyConversation>('Conversation', conversationSchema)

export default Conversation
