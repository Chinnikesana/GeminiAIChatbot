import Header from "./components/Header"
import Footer from "./components/footer/footer"
import {Routes, Route} from 'react-router-dom'
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Chat from "./pages/Chat"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import { UserAuth } from "./context/authContext"
function App() {
  const auth=UserAuth()
  console.log(UserAuth()?.isLoggedIn)
  return (
  <main>
    <Header/>
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/login" element={<Login/>}/>
      {auth?.isLoggedIn && auth.user && <Route path="/chat" element={<Chat/>}/>}
      <Route path="/signup" element={<Signup/>}/>
      <Route path="*" element={<NotFound/>}/>

    </Routes>
   
  </main>
  )
}

export default App
