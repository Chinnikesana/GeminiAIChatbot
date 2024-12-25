import { Router } from "express";
import { deleteChats, generateChatCompletion ,sendingChatstoUser} from "../controllers/chat-controllers.js";
import { chatCompletionValidator, validate } from "../utils/validators.js";
import { verifyToken } from "../utils/token-manager.js";

const chatRouters = Router();

chatRouters.post("/new", validate(chatCompletionValidator), verifyToken, generateChatCompletion);

chatRouters.get("/all-chats",verifyToken,sendingChatstoUser)

chatRouters.delete("/delete", verifyToken, deleteChats);

export default chatRouters;