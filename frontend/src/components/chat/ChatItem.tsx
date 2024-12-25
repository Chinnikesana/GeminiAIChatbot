import { Box, Avatar, Typography } from "@mui/material";
import { UserAuth } from "../../context/authContext";

import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {  coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { BiBorderRadius } from "react-icons/bi";
 
function extractCodeFromString(message: string) {
  if (message.includes("```")) { 
    const blocks = message.split("```");
    return blocks;
  }
}
function isCodeBlock(str:string){
  if(str.includes("=")||str.includes(";")||str.includes("[")||str.includes("]")||str.includes("]")||str.includes("{")||str.includes("}")||str.includes("#")||str.includes("//")){
    if(str.includes("**Explanation**")|| str.includes("*")){
      return false
    }
    return true;
  }
  return false;
}
function identifyLanguage(str: string) {
  if (str.includes('print(') && str.includes(':') && !str.includes(';')) {
    return 'Python';
  } else if (str.includes('console.log(') && str.includes(';')) {
    return 'JavaScript';
  } else if (str.includes('System.out.println(') && str.includes(';')) {
    return 'Java';
  } else if (str.includes('printf(') && str.includes(';') && !str.includes('std::')) {
    return 'C';
  } else if (str.includes('std::cout') && str.includes('<<') && str.includes(';')) {
    return 'C++';
  } else if (str.includes('Console.WriteLine(') && str.includes(';')) {
    return 'C#';
  } else if (str.includes('echo ') && !str.includes(';')) {
    return 'Bash or PHP';
  } else if (str.includes('fmt.Println(') && str.includes(';')) {
    return 'Go';
  } else if (str.includes('<h1>') && str.includes('</h1>')) {
    return 'HTML';
  } else if (str.includes('SELECT') && str.includes(';')) {
    return 'SQL';
  } else if (str.includes('println!("') && str.includes(';')) {
    return 'Rust';
  } else if (str.includes('fun') && str.includes('println') && !str.includes(';')) {
    return 'Kotlin';
  } else if (str.includes('fn') && str.includes('{') && str.includes('}')) {
    return 'Rust or Go';
  } else if (str.includes(':') && str.includes('=>') && !str.includes(';')) {
    return 'Haskell';
  } else if (str.includes('let') && str.includes(';') && str.includes('{')) {
    return 'JavaScript or TypeScript';
  }
  else{
    return 'some language'
  }
 
}


const ChatItem = ({ content,role}: { content: string; role: "user" | "assistant";  load?:boolean}) => {
  const auth = UserAuth();
  const initials = auth?.user?.name ? auth.user.name.split(' ').map(name => name[0]).join('').toUpperCase() : '';
const messageBlocks=extractCodeFromString(content);
  return role === "assistant" ? (
    <Box sx={{ display: "flex", p: 1, bgcolor: "rgba()", my: 0.3, mx:2,gap:1}}>
      <Avatar sx={{ ml: "0" }}>
        <img src="gemini-removebg-preview.png" alt="openai img" width={"30px"}/>
      </Avatar>
      <Box>

        {!messageBlocks && <Typography sx={{
          fontSize:"20px"
        }}>{content}</Typography>}

{messageBlocks && messageBlocks.length && messageBlocks.map((block, index) => (
  isCodeBlock(block) ? 
  (<SyntaxHighlighter key={index} style={coldarkDark} language={identifyLanguage(block)}>{block}</SyntaxHighlighter>)
  : (<Typography key={index} sx={{ fontSize: "20px" }}>{block}</Typography>)
))}

      </Box>
    </Box>
  ) : (
    <Box sx={{ display: "flex", p: 1.2, bgcolor: "rgba(32,32,32)", my: 1, gap: 1,mx:2 }} borderRadius={'10px'}>
      <Avatar sx={{ ml: "0", bgcolor: "black", color: "white" }}>
        {initials}
      </Avatar>
      <Box>
        <Typography fontSize={"20px"}>{content}</Typography>
      </Box>
      <Box>

      </Box>
    </Box>
   
  );
}

export default ChatItem;
