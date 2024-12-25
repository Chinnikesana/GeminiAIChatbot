// import React from 'react'
import { AppBar, Toolbar } from '@mui/material';
import Logo from './shared/Logo';
import { UserAuth } from '../context/authContext';
import NavigationLink from './shared/NavigationLink';
const Header = () => {
  const auth=UserAuth();
  return (
    <AppBar sx={{bgcolor:"transparent" , position:"static", boxShadow:"none"
    }}>
      <Toolbar sx={{display:"flex"}}>
        <Logo/>
        <div>
         {auth?.isLoggedIn?(<>
         <NavigationLink bg="#00fffc" to='/chat
         ' text="Go to chat" textColor="black"/>
         <NavigationLink bg="#51538f" textColor="white" to="/" text="logout" onClick={auth.logout} />
         </>):(<>
          <NavigationLink bg="#00fffc" to='/login' text="login" textColor="black"/>

         <NavigationLink bg="#51538f" textColor="white" to="/signup" text="signup"  />
         </>) }
        </div>
        
      </Toolbar>
    </AppBar>
  )
}

export default Header
