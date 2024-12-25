import axios from 'axios'

export const loginUser=async (email :string, password:string)=>{
  const res=await axios.post("/user/login",{email,password})
  if(res.status!==200){
    throw new Error("unable to login")
  }
  const data=await res.data;
  return data;
 
}

export const signupUser=async (
  name:string,
  email :string, password:string)=>{
  const res=await axios.post("/user/signup",{name,email,password})
  if(res.status!==201){
    throw new Error("unable to signup")
  }
  console.log("signup response:",res.data)
  const data=await res.data;
  if (data.token) {
    console.log("Token generated ")
  }
  return data;
 
} 

export const checkAuthStatus=async ()=>{
  const res=await axios.get("/user/auth-status")
  // console.log("in helper!")
  if(res.status!==200){
    throw new Error("unable to authenticate")
  }
  const data=await res.data;
  return data;
}

export const sendChatRequest = async (message: string) => {
  try {
    const res = await axios.post("/chat/new", { message }, { timeout: 10000 }); // Timeout for responsiveness
console.log("content from backend:",res)
    if (res.status !== 200) {
      throw new Error(`Unexpected response status: ${res.status}`);
    }

    return res.data;
  } catch (error: any) {
    // Handle network errors or timeout
    if (error.response) {
      console.error(`Server responded with status ${error.response.status}: ${error.response.data}`);
      throw new Error(`Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error('No response received from the server', error.request);
      throw new Error('No response received. Please check your connection or try again later.');
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout', error.message);
      throw new Error('Request timed out. Please try again later.');
    } else {
      console.error('Error occurred while making the request', error.message);
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const getUserChats=async()=>{
  const res=await axios.get('/chat/all-chats');
  if(res.status!==200){
    throw new Error("unable to get chats from backend!")
  }
  const data=await res.data

  
  return data;
}

export const deleteUserChats=async()=>{
  const res=await axios.delete('/chat/delete');
  if(res.status!==200){
    throw new Error("unable to delete chats in backend!")
  }
  const data=await res.data
  
  return data;
}

export const logoutUser=async()=>{
  const res=await axios.delete('/user/logout');
  if(res.status!==200){
    throw new Error("unable to logout backend!")
  }
  const data=await res.data
  
  return data;
}
