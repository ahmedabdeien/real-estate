import { useEffect } from "react";
import { useLocation, Navigate } from "react-router-dom";
import DashSideBar from "./DashSideBar";
import DashProfile from "./DashProfile";
import { useSelector } from "react-redux";
import NotFound from "../NotFound/NotFound";
import DashPagesFinished from './DashPagesFinished';
import DashUsers from './DashUsers';
import DashbordData from "./DashbordData";
import PageManager from "./PageManager";
import BlogManager from "./BlogManager";
import DashMessages from "./DashMessages";

function Dashboard() {
    const { currentUser } = useSelector((state) => state.user);
    const location = useLocation();
    const tab = new URLSearchParams(location.search).get('tab');

    const isAdmin = currentUser?.role === 'Admin';
    const isSales = currentUser?.role === 'Sales';
    const hasStaffAccess = isAdmin || isSales;

    // Regular users have no access to the dashboard
    if (!hasStaffAccess) {
        return <Navigate to="/" replace />;
    }

    const renderTabContent = () => {
        switch (tab) {
            case 'Profile':
                return <DashProfile />;
            case 'pagesFinished':
                return hasStaffAccess ? <DashPagesFinished /> : <NotFound />;
            case 'blogs':
                return hasStaffAccess ? <BlogManager /> : <NotFound />;
            case 'messages':
                return hasStaffAccess ? <DashMessages /> : <NotFound />;
            case 'users':
                return isAdmin ? <DashUsers /> : <NotFound />;
            case 'dashbordData':
                return isAdmin ? <DashbordData /> : <NotFound />;
            case 'staticPages':
                return isAdmin ? <PageManager /> : <NotFound />;
            default:
                return isAdmin ? <DashbordData /> : <DashPagesFinished />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="md:w-56 bg-transparent">
                <DashSideBar />
            </div>
            <div className="w-full overflow-hidden">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Dashboard;
