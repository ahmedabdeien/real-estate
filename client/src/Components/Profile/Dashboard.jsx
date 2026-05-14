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
        <div className="flex" dir="rtl" style={{ minHeight: 'calc(100vh - 72px)' }}>
            {/* Sidebar - sticky column */}
            <div className="w-64 flex-shrink-0 overflow-y-auto" style={{ position: 'sticky', top: 0, height: 'calc(100vh - 72px)', borderLeft: '1px solid rgba(18,40,60,0.15)' }}>
                <DashSideBar />
            </div>
            {/* Main Content Area */}
            <div className="flex-1 overflow-auto" style={{ background: '#f5f4f1' }}>
                {renderTabContent()}
            </div>
        </div>
    );
}

export default Dashboard;
