import { useLocation } from "react-router-dom";
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
            case 'staticPages':
                return currentUser.isAdmin ? <PageManager /> : <NotFound />;
            case 'blogs':
                return currentUser.isAdmin ? <BlogManager /> : <NotFound />;
            case 'messages':
                return (currentUser.isAdmin || currentUser.role === 'Sales') ? <DashMessages /> : <NotFound />;
            default:
                return <DashProfile />;
        }
    };

    return (
        <div className="min-h-screen flex" dir="rtl">
            {/* Sidebar - sticky column */}
            <div className="w-60 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-hidden border-l border-slate-200">
                <DashSideBar />
            </div>
            {/* Main Content Area */}
            <div className="flex-1 bg-slate-50 overflow-auto min-h-[calc(100vh-4rem)]">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Dashboard;
