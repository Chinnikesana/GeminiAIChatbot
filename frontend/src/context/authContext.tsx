import { ReactNode, useContext, useState } from 'react'
import { createContext } from 'react'
import {useEffect} from 'react'
import { checkAuthStatus, loginUser,logoutUser , signupUser} from '../helpers/api-communicators';

type User={
name:string;
email:string
}

type UserAuth={
  isLoggedIn: boolean;
  user:User | null;
  login :(email:string, password:string)=>Promise<void>;
  signup:(name :string ,email:string , password: string)=>Promise<void>;
  logout:()=>Promise<void>
}

const authContext=createContext<UserAuth | null>(null)
export const AuthProvider= ({children}:{children: ReactNode })=>{
  const [user, setUser]=useState<User | null >(null)
  const [isLoggedIn, setIsLoggedIn]=useState(false)

  useEffect(()=>{
    async function checkStatus(){
      const data=await checkAuthStatus();

      if(data){
        setUser({email:data.email,name:data.name})
        setIsLoggedIn(true)
    }
    }
    checkStatus()
  },[]);
  const login=async(email:string, password:string)=>{
    const data=await loginUser(email,password)
    if(data){
      setUser({email:data.email,name:data.name})
      setIsLoggedIn(true)
  }
  }
  const signup=async(name:string, email:string , password:string)=>{
    const data=await signupUser(name,email,password)
    if(data){
      setUser({email:data.email,name:data.name,})
      setIsLoggedIn(true)
    }

  };
  const logout=async()=>{
    await logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    window.location.reload();
  }
  const value={
    user,
    isLoggedIn,
    login,logout,signup
  };
  return <authContext.Provider value={value}>{children}</authContext.Provider>
}

export const UserAuth=()=> useContext(authContext)