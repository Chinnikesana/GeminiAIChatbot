// import React from 'react';
import { Box, useMediaQuery,useTheme } from '@mui/material';
// import React, { useRef } from 'react';
import TypingAnimation from '../components/shared/typer/typingAnimation'; // Corrected import
import Footer from '../components/footer/footer';

const Home = () => {
  const theme=useTheme();
  const isBelowmd=useMediaQuery(theme.breakpoints.down("md"))
  // const myRef = useRef(null);
  return (
    <Box width={"100%"} height={"100%"}>
      <Box
        sx={{
          display: "flex",
          width: "100%",
          mt:1,
          flexDirection: "column",
          alignItems: "center",
          mx: "auto",
          
        }}
      >
        <Box>
          <TypingAnimation></TypingAnimation>
        </Box>
        <Box sx={{width:"100%",display:"flex",flexDirection:{md:"row",xs:"column", sm:"column"},

      gap:5,my:10}}>
        <img src='\try1-removebg-preview.png'
        alt='robot'
        style={{width:"200px",margin:"auto"}}/>
        <img src='\gemini-removebg-preview.png'
        alt='robot'
        className='image-invert rotate'
        style={{width:"100px",margin:"auto"}}/>


      </Box>
      <Box sx={{display:"flex",width:"100%",mx:"auto"}}> 
      <img
      src='chat.png'
      style={{display:"flex",width:"40%",margin:"auto",borderRadius:20,boxShadow:'-5px -5px 75px #64f3d5',
        marginBottom:5,
        marginTop:5,

       }}/>


      </Box>
      </Box>
      <Footer/>
    </Box>
  );
};

export default Home;
