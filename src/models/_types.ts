export interface MyUser {

  _id: string

  name: string

  uniqueName: string

  email: string

  lastOnline: string

  theme: "Light" | "Dark" | "Auto"

  fontSize: "Small" | "Normal" | "Large"

  biography: string

  phoneNumber: string

  sendWithEnter: boolean

  password: string

  verify: string

  tokens: { token: string; }[]

  avatar: {

    normal: Buffer | undefined

    small: Buffer | undefined

  }

  toJSON: () => Object

  toObject: () => Object

  toPublicJSON: () => Object

  generateAuthToken: () => Promise<string>

  sendVerificationEmail: () => Promise<Object>

  sendExitEmail: () => Promise<Object>

  populate: (obj: Object) => Promise<void>

  save: () => Promise<Object>

  changeUniqueName: (name: string) => Promise<MyUser>

  changeEmail: (email: string) => Promise<MyUser>

  changeLastOnline: (online?: string) => Promise<MyUser>

}

export interface MyConversation {

  _id: string

  owners: {

    ownerID: string

    dateJoined: string

    isAdmin: boolean

    lastChecked: string

  }[]

  messages: MyMessage[]

  isGroup: boolean

  groupImage: {

    normal: Buffer | undefined

    small: Buffer | undefined

  }

  groupName: string

  groupDescription: string

  roomKey: string

  toJSON: () => Object

  save: () => Promise<Object>

  addGroupMember: (user: MyUser) => Promise<Object>

  removeGroupMember: (user: MyUser) => Promise<Object>

  setGroupName: (newName: string) => Promise<Object>

  setGroupImage: (small: Buffer, normal: Buffer) => Promise<Object>

  sendTextMessage: (message: MyMessage) => Promise<Object>

  sendImageMessage: (message: MyMessage) => Promise<Object>

  updateTextMessage: (messageID: string, newText: string) => Promise<Object>

  deleteMessage: (messageID: string) => Promise<Object>

}


export interface MyMessage {

  _id: string

  ownerID: string

  reference: string

  messageType: "Text" | "Image"

  text: string

  image: {

    available: boolean

    normal: Buffer | undefined

    small: Buffer | undefined

  }

  toJSON: () => Object

  save: () => Promise<Object>

}
