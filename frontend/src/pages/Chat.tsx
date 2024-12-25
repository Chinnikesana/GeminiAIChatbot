import  { useRef,useLayoutEffect, useState, useEffect } from 'react'
import { useNavigate} from 'react-router-dom'
import { Box, Avatar,Button ,IconButton,Typography } from "@mui/material"
import red from "@mui/material/colors/red"
import {IoMdSend} from "react-icons/io"
import { UserAuth } from "../context/authContext.tsx"
import ChatItem from '../components/chat/ChatItem.tsx';
import {toast} from 'react-hot-toast'
import { sendChatRequest,getUserChats, deleteUserChats } from '../helpers/api-communicators.tsx'
type message={
  role:"user"|"assistant";
  content:string;
}

const Chat = () => {
  const navigate=useNavigate()
  const auth = UserAuth();
  const [chatMessages, setChatMessages]=useState<message[]>([])
  const inputRef=useRef<HTMLInputElement | null>(null)
  //@ts-ignore
  const getInitials = (name) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length < 2) return nameParts[0][0]; 
    return `${nameParts[0][0]}${nameParts[1][0]}`;
  };
  

  const [loading, setLoading] = useState(false);
  const handleSubmit= async()=> {
    const content = inputRef.current?.value as string;
    if(inputRef && inputRef.current) {
      inputRef.current.value = "";
    }
    
    const newMessage:message={role:"user", content};
    setChatMessages((prev)=>[...prev, newMessage]); // Append user's message
    
  
    try {
      setLoading(true)
      const chatData = await sendChatRequest(content);
      setChatMessages([...chatData.chats]);
      setLoading(false) 
    } catch (error) {
      console.error('Error in sending chat request:', error);
      // Optionally, you can display an error message to the user in case of failure
    }
  }
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  if (chatContainerRef.current) {
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }
}, [chatMessages]); // This effect will run every time chatMessages change

useEffect(() => {
  if(!auth?.user){
     return navigate("/login");
  }
})

const handleDeleteChats=async()=>{
try{
  await deleteUserChats();
  setChatMessages([]);
  toast.success("Deleted chats",{id:"deletehcats"})
}
catch(err){
  console.log(err);
  toast.error("chats deletion failed",{id:"deletechats"})
}
}
useLayoutEffect(()=>{
  if(auth?.isLoggedIn && auth.user){
    //  toast.loading("Loading chats",{id:"loadchats"});
     getUserChats().then((data)=>{
setChatMessages([...data.chats]);
toast.success("Successfully loaded chats",{id:"loadschats"})
     })
     .catch((err)=>{console.log(err);
      toast.error("loading failed",{id:"loadchats"})
  })

  }
},[auth])
  return (
    <Box sx={{ display: "flex", flex: 1, width: "100%", height: "100%", mt: 3, gap: 3, position: "relative" }}>
      <Box sx={{ display: { xs: "none", sm: "none", md: "flex" }, flex: 0.2, flexDirection:"column" }}>
        <Box sx={{ display: "flex", height: "70vh", width: "40vh", bgcolor: "rgb(17,29,39)", borderRadius: 5, flexDirection: "column", mx: 2, zIndex: 1, p:2 }}>
          <Avatar sx={{ mx: "auto", my: 2, bgcolor: 'white', color: 'black', fontWeight: 700 }} className="chat">
            {auth?.user?.name && getInitials(auth.user.name).toUpperCase()}
          </Avatar>
          <Typography sx={{ mx: "auto", fontFamily:"Salsa"}}>
            Hello {auth?.user?.name}, I am GEMINI AI chat Bot
          </Typography>
          <Typography sx={{ mx: "auto", fontFamily:"inherit", my: 3, p: 1, color: "white" }}>
           You can ask me any kind of question i will try to answer Also avoid sharing personal details.
          </Typography>
<Button onClick={handleDeleteChats}

sx={{width:"200px", my:"auto",color:"white",fontweight:"700",borderRadius:3,mx:"auto",bgcolor:red[300], ":hover":{bgcolor:red.A400}}}>Delete chat</Button>
        </Box>
      </Box>
      <Box sx={{display:"flex", flex:{md:0.8,xs:1,sm:1, flexDirection:"column"}}}>
        <Typography sx={{textAlign:"center",fontSize:"40px",color:"white",mb:2, mx:"auto"}}>
          GEMINI AI 1.5 Flash 😎
          </Typography>
          <Box
ref={chatContainerRef}           sx={{

            width:"100%",
            height:"70vh",
            borderRadius:3,
            mx:"auto",
            display:"flex",
            flexDirection:"column",
            overflow:"scroll",
            overflowX:"hidden",
            overflowY:"auto",
            scrollBehavior:"smooth"
          }}>
            
  {chatMessages.map((chat, index)=>//@ts-ignore
 <ChatItem content={chat.content} role={chat.role} key={index} load={loading} />

  )}
   </Box>
<div style={{width:"100%",padding:"10px", borderRadius:8,backgroundColor:"rgb(64,64,64)" ,display:"flex", margin:"auto"}}>
          <input
          ref={inputRef}
          type='text' style={{width:"100%", backgroundColor:"transparent", padding:"10px", border:"none",outline:"none",color:"white", fontSize:"20px"}}/>
          <IconButton onClick={handleSubmit}  sx={{ml:1, color:"white"}}><IoMdSend/></IconButton></div>
           
           </Box>
    </Box>
  )
}

export default Chat
