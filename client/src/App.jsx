import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home/Home";
import SingIn from "./Components/Registry/SingIn/Signin";
import ForgotPassword from "./Components/Registry/SingIn/ForgotPassword.jsx";
import SignUp from "./Components/Registry/SingUp/Signup";
import About from "./Components/About/About";
import Project from "./Components/Project/Project";
import Header from "./Components/Header/Header";
import PrivateRoute from "./Components/PrivateRoute/PrivateRoute";
import NotFound from "./Components/NotFound/NotFound";
import CreatePage from "./Components/CreatePage/CreatePage";
import UpdatePage from "./Components/CreatePage/UpdatePage";
import Footer from "./Components/Footer/Footer";
import OnlyAdminPrivateRoute from "./Components/PrivateRoute/OnlyAdminPrivateRoute";
import Dashboard from "./Components/Profile/Dashboard";
import PageBroker from "./Components/Profile/PageBroker";
import BrokerPrivateRoute from "./Components/PrivateRoute/BrokerPrivateRoute";
import ShowPage from "./Components/CreatePage/ShowPage";
import Contact from "./Components/Contact/Contact";
import Settings from "./Components/Settings/Settings";
import ButtonTop from "./Components/ButtonTop/ButtonTop";
import Loading from "./Loading.jsx"; // Import the Loading component
import ResetPassword from "./Components/Registry/SingIn/ResetPassword.jsx";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate a loading time (e.g., fetching resources)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust duration as needed

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Header />
      <div className="relative">
        <ButtonTop />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Signin" element={<SingIn />} />
        <Route path="/Forgot-Password" element={<ForgotPassword />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/Signup" element={<SignUp />} />
        <Route path="/About" element={<About />} />
        <Route path="/Project" element={<Project />} />
        <Route path="/Contact" element={<Contact />} />
        <Route path="/Projects/:pageSlug" element={<ShowPage />} />
        <Route element={<PrivateRoute />}>
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route element={<OnlyAdminPrivateRoute />}>
          <Route path="/CreatePage" element={<CreatePage />} />
          <Route path="/Update-Page/:pageId" element={<UpdatePage />} />
        </Route>
        <Route element={<BrokerPrivateRoute />}>
          <Route path="/PageBroker" element={<PageBroker />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
