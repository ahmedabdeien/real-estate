import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import SingIn from "./Components/Registry/SingIn/Signin";
import SignUp from './Components/Registry/SingUp/Signup';
import Profile from "./Components/Profile/Profile";
import About from './Components/About/About';
import Header from "./Components/Header/Header";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";

function App() {
 
  return (
    <BrowserRouter>
    {/* component the header */}
    <Header/>
    {/* component the OutLet change pages  */}
      <Routes>
         <Route path="/" element={<Home/>}/>
         <Route path="/Signin" element={<SingIn/>}/>
         <Route path="/Signup" element={<SignUp/>}/>
         <Route path="/About" element={<About/>}/>
         <Route element={<PrivateRoute/>}>
         <Route path="/Profile" element={<Profile/>}/>
         </Route>
      </Routes>
      {/* component the footer */}
    </BrowserRouter>
  )
}

export default App