

import axios from 'axios'
import { Request, Response, NextFunction } from "express";
import User from "../models/User.js";

export const generateChatCompletion = async (req: Request, res: Response, next: NextFunction) => {
  const { message } = req.body;
  console.log("Received message from client:", message);

  try {
    const user = await User.findById(res.locals.jwtData.id);
    // console.log("User fetched from DB:", user);

    if (!user) {
      console.log("User not found or invalid token");
      return res.status(401).json({ message: "User not registered or token malfunction" });
    }

    // Append user message to chats
    const chats = user.chats.map(({ role, content }) => ({ role, content }));
    chats.push({ content: message, role: 'user' });
    user.chats.push({ content: message, role: "user" });

    // Send request to Gemini AI API
    console.log("Sending request to Gemini AI API...");
    const result = await axios({
      url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_AI_API_KEY}`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        contents: [
          {
            parts: [
              {
                text: message  // Dynamically pass the user's message here
              }
            ]
          }
        ]
      }
    });
   
    
    const botReply = result.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated by AI';
    
    // Format the bot's reply using the function    
    console.log("Formatted Bot reply:", botReply);
    

    // Append bot reply to user's chat history
    user.chats.push({ content: botReply, role: "assistant" });
    await user.save();
    console.log("User chats saved successfully");

    return res.status(200).json({ chats: user.chats });
  } catch (err) {
    console.log("Error in generating chat completion:", err);
    return res.status(500).json({ message: "Something went wrong with user chats" });
  }
};


export const sendingChatstoUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
   //check user token
    const user = await User.findById(res.locals.jwtData.id);
  
    if (!user) {
      return res.status(401).send("user not registered or token malfunctioned");
    }
    if(user._id.toString()!==res.locals.jwtData.id){
     return res.status(401).send({message:"permission didnot match"})
    } 
    
    return res.status(200).json({ message: "OK", chats:user.chats});
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  } 
};

export const deleteChats= async (req: Request, res: Response, next: NextFunction) => {
  try {
   //check user token
    const user = await User.findById(res.locals.jwtData.id);
  
    if (!user) {
      return res.status(401).send("user not registered or token malfunctioned");
    }
    if(user._id.toString()!==res.locals.jwtData.id){
     return res.status(401).send({message:"permission didnot match"})
    } 
    // @ts-ignore
    user.chats=[]
await user.save()    
    return res.status(200).json({ message: "OK"});
  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ message: "Internal Server Error", error: err.message });
  } 
};
