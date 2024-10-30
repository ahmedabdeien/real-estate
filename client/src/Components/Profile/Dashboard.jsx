import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashSideBar from "./DashSideBar";
import DashProfile from "./DashProfile";
import { useSelector } from "react-redux";
import NotFound from "../NotFound/NotFound";
import DashPagesFinished from './DashPagesFinished';
import DashUsers from './DashUsers';
import DashbordData from "./DashbordData";

function Dashboard() {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab');

    const renderTabContent = () => {
        switch (tab) {
            case 'Profile':
                return <DashProfile />;
            case 'pagesFinished':
                return currentUser.isAdmin ? <DashPagesFinished /> : <NotFound />;
            case 'users':
                return currentUser.isAdmin ? <DashUsers /> : <NotFound />;
            case 'dashbordData':
                return currentUser.isAdmin ? <DashbordData /> : <NotFound />;
            default:
                return <NotFound />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="md:w-56  bg-transparent">
                {/* Sidebar */}
                <DashSideBar />
            </div>
            <div className="w-full overflow-hidden">
                {/* Content */}
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Dashboard;
