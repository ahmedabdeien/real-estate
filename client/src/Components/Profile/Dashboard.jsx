import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import DashSideBar from "./DashSideBar"
import DashProfile from "./DashProfile"
import { useSelector } from "react-redux";
import NotFound from "../NotFound/NotFound";
import DashPagesFinished from './DashPagesFinished';



function Dashboard() {
    const {currentUser} = useSelector((state) => state.user);
    const location = useLocation()
    const [tab, setTab] = useState('')
    useEffect(()=>{
        const urlParams = new URLSearchParams(location.search)
        const tabFromUrl = urlParams.get('tab')
        if(tabFromUrl){
            setTab(tabFromUrl)}
    },[location.search])
  return <>
    <div className="min-h-screen  flex flex-col md:flex-row">
        <div className=" md:w-56">
            {/* sidebar */}
            <DashSideBar />
        </div>
        <div className="w-full overflow-hidden">
            {/* content */}
            {tab === 'Profile' && <DashProfile/>}
            {currentUser.isAdmin && tab ===  'pagesFinished' && <DashPagesFinished/>}
            { tab === '*' && <NotFound/>}
        </div>
    </div>
    </>
}

export default Dashboard