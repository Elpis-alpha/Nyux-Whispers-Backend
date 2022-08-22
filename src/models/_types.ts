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

    normal: Buffer

    small: Buffer

  }

  groupName: string

  toJSON: () => Object

  save: () => Promise<Object>

}


export interface MyMessage {

  _id: string

  ownerID: string

  reference: string

  messageType: "Text" | "Image"

  text: string

  image: {

    available: boolean

    normal: Buffer

    small: Buffer

  }

  toJSON: () => Object

  save: () => Promise<Object>

}
