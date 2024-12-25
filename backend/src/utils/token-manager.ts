import { NextFunction, Response, Request } from 'express';
import jwt from 'jsonwebtoken';
import { COOKIE_NAME } from './constant.js';

export const createToken = (id: string, email: string, expiresIn: string) => {
  const payload = { id, email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  console.log("token created :", token)
  return token;
};

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[`${COOKIE_NAME}`];
    console.log("here is token: ",token)
    if (!token) {
      return res.status(401).json({ message: 'Authentication failed, no token provided' });
    }
    return new Promise<void>((resolve,reject)=>{
      return jwt.verify(token, process.env.JWT_SECRET,(err,sucess)=>{
        if(err){
          reject(err.message)
          return res.status(401).json({message:"token expired"})
        }
        else{
          console.log("Token verification successfull")
          resolve()
          res.locals.jwtData=sucess
          return next()
        }
      })
    })
    
  } catch (err) {
    console.log("Error verifying token:", err);
    
    return res.status(401).json({ message: 'Authentication failed, invalid token' });
  }
};



