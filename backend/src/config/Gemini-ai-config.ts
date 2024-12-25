
// Make sure to include these imports:
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
export const gemini_ai_api=()=>{
  try{
const API_KEY =process.env.GEMINI_AI_API_KEY;
    
    const genAI = new GoogleGenerativeAI(API_KEY);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


return model}
catch(err){
console.log(err.message)
};

}

