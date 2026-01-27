import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import i18n from './i18n';
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
import AdminSettings from "./Components/Profile/AdminSettings";
import BrokerPrivateRoute from "./Components/PrivateRoute/BrokerPrivateRoute";
import ShowPage from "./Components/CreatePage/ShowPage";
import Contact from "./Components/Contact/Contact";
import Settings from "./Components/Settings/Settings";
import ButtonTop from "./Components/ButtonTop/ButtonTop";
import Loading from "./Loading.jsx"; // Import the Loading component
import { useDispatch } from "react-redux";
import { fetchConfigStart, fetchConfigSuccess, fetchConfigFailure } from "./Components/redux/config/configSlice";
import ResetPassword from "./Components/Registry/SingIn/ResetPassword.jsx";
import FloatingChat from "./Components/Chat/FloatingChat";



function App() {
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        dispatch(fetchConfigStart());
        const res = await fetch('/api/config');
        const data = await res.json();



        if (data && !data.success === false) {
          dispatch(fetchConfigSuccess(data));

          // Apply CSS variables dynamically
          if (data.primaryColor) document.documentElement.style.setProperty('--primary', data.primaryColor);
          if (data.accentColor) document.documentElement.style.setProperty('--accent', data.accentColor);

          // Inject dynamic translations
          if (data.translations) {
            Object.keys(data.translations).forEach(lang => {
              if (data.translations[lang]) {
                i18n.addResourceBundle(lang, 'translation', data.translations[lang], true, true);
              }
            });
          }
        } else {
          dispatch(fetchConfigFailure(data?.message || 'Failed to load config'));
        }

      } catch (error) {
        dispatch(fetchConfigFailure(error.message));
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, [dispatch]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <BrowserRouter>
      <Header />
      <div className="relative pt-20">
        <ButtonTop />
        <FloatingChat />
      </div>

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
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
                <Route path="/Admin-Settings" element={<AdminSettings />} />
              </Route>
              <Route element={<BrokerPrivateRoute />}>
                <Route path="/PageBroker" element={<PageBroker />} />
              </Route>
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </BrowserRouter >
  );
}

export default App;
