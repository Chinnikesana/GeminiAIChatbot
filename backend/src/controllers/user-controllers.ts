import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { compare, hash } from 'bcrypt';
import { createToken } from '../utils/token-manager.js';
import { COOKIE_NAME } from '../utils/constant.js';

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Internal Server Error", error: "Database connection not established" });
    }
    const users = await User.find();
    return res.status(200).json({ message: "OK", users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const userSignup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const userExistcheck = await User.findOne({ email });
    if (userExistcheck) return res.status(401).json({ message: "user already exists!" });

    const hashpassword = await hash(password, 10);
    const user = new User({ name, email, password: hashpassword });
    await user.save();

    res.clearCookie(COOKIE_NAME, {
      domain: "localhost",
      httpOnly: true,
      signed: true,
      path: '/'
    });

    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie(COOKIE_NAME, token, { path: "/", domain: "localhost", expires, httpOnly: true });

    return res.status(201).json({ message: "OK", name: user.name, user: email });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};



export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const user = await User.findById(res.locals.jwtData.id);
  
    if (!user) {
      return res.status(401).send("user not registered or token malfunctioned");
    }
    if(user._id.toString()!==res.locals.jwtData.id){
return res.status(401).send({message:"permission didnot match"})
    }

    
    
    return res.status(200).json({ message: "OK", name: user.name, email:user.email });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


export const userLogout = async (req: Request, res: Response, next: NextFunction) => {
  try {
   
    const user = await User.findById(res.locals.jwtData.id);
  
    if (!user) {
      return res.status(401).send("user not registered or token malfunctioned");
    }
    if(user._id.toString()!==res.locals.jwtData.id){
return res.status(401).send({message:"permission didnot match"})
    }
    res.clearCookie(COOKIE_NAME, {
      domain: "localhost",
      httpOnly: true,
      signed: true,
      path: '/'
    });
    
    return res.status(200).json({ message: "OK", name: user.name, email:user.email });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const userLogin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("user does not exist");
    }
    const passwordCheck = await compare(password, user.password);
    if (!passwordCheck) return res.status(403).send("Incorrect password!");

    res.clearCookie(COOKIE_NAME, {
      domain: "localhost",
      httpOnly: true,
      signed: true,
      path: '/'
    });

    const token = createToken(user._id.toString(), user.email, "7d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);
    res.cookie(COOKIE_NAME, token, { path: "/", domain: "localhost", expires, httpOnly: true });

    return res.status(200).json({ message: "OK", name: user.name, user: email });
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
