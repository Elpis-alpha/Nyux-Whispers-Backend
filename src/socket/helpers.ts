import jsonwebtoken from 'jsonwebtoken'

import User from '../models/User'


export const getUserFromToken = async (token: string) => {

  if (!token) return false

  const jwtSecret: any = process.env.JWT_SECRET

  const decoded = jsonwebtoken.verify(token, jwtSecret)

  if (typeof decoded === "string") return false

  const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }, { avatar: 0 })

  if (!user) return false

  return user

}