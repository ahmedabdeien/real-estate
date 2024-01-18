import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import SingIn from "./Components/Registry/SingIn/SingIn";
import SignUp from './Components/Registry/SingUp/Signup';
import Profile from "./Components/Profile/Profile";
import About from './Components/About/About';
import Header from "./Components/Header/Header";

function App() {
 
  return (
    <BrowserRouter>
    {/* component the header */}
    <Header/>
    {/* component the OutLet change pages  */}
      <Routes>
         <Route path="/" element={<Home/>}/>
         <Route path="/SingIn" element={<SingIn/>}/>
         <Route path="/Signup" element={<SignUp/>}/>
         <Route path="/Profile" element={<Profile/>}/>
         <Route path="/About" element={<About/>}/>
      </Routes>
      {/* component the footer */}
    </BrowserRouter>
  )
}

export default App