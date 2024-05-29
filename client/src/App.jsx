import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import SingIn from "./Components/Registry/SingIn/Signin";
import SignUp from './Components/Registry/SingUp/Signup';
import Profile from "./Components/Profile/Profile";
import About from './Components/About/About';
import Project from './Components/Project/Project';
import Header from "./Components/Header/Header";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import NotFound from"./Components/NotFound/NotFound.jsx"
import CreatePage from "./Components/CreatePage/CreatePage.jsx";
import Footer from "./Components/Footer/Footer.jsx";
import OnlyAdminPrivateRoute from "./Components/PrivateRoute/OnlyAdminPrivateRoute.jsx";

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
         <Route path="/Project" element={<Project/>}/>
         <Route element={<PrivateRoute/>}>
           <Route path="/Profile" element={<Profile/>}/>
           <Route path="*" element={<NotFound/>}/>
         </Route>
         <Route element={<OnlyAdminPrivateRoute/>}>
           <Route path="/create-Page" element={<CreatePage/>}/> 
         </Route>
      </Routes>
      {/* component the footer */}
      <Footer/>
    </BrowserRouter>
  )
}

export default App