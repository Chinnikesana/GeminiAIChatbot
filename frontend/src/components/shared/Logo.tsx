import { Typography } from '@mui/material'
import React from 'react'
import {Link } from 'react-router-dom'
const Logo =()=>{

  return (
    <div style={{display:"flex", color:"white",marginRight:"auto", alignItems:"center", gap:"15px"}}>
      <Link to={"/"}>
<img style={{margin:2}} src="gemini-removebg-preview.png" alt="" width={"40px"} height={"40px"}  className='image.inverted'
/>   </Link>

<Typography sx={{display:{md:"block", sm:"none", xs:"none"}, mr:"auto" , fontWeight:"800", textShadow:"2px 2px 20px #000"}}>
  <span style={{fontSize:"20px"}}>MERN</span>. Chat Bot
</Typography>
     
    </div>
  )
}

export default Logo