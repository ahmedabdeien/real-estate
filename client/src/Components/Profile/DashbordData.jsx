import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Search,
  SlidersHorizontal, 
  RefreshCcw,
  User,
  Shield,
  Briefcase
} from 'lucide-react';

const DashboardData = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboardData');
  const [userStats, setUserStats] = useState({
    users: [],
    totalUsers: 0,
    lastMonthUsers: 0
  });
  const [userPages, setUserPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');

  // Format large numbers with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
    fetchDashboardData();
  }, [location, sortBy]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [statsRes, pagesRes] = await Promise.all([
        fetch('/api/user/getusers', {
          headers: {
            'Content-Type': 'application/json',
            // Include any auth headers if needed
          },
        }),
        currentUser?.isAdmin ? 
          fetch(`/api/listing/getPages?limit=200&sortBy=${sortBy}`) : 
          Promise.resolve(null)
      ]);

      if (!statsRes.ok) throw new Error('Failed to fetch user statistics');
      const statsData = await statsRes.json();
      
      // Calculate totals from the users array
      const totalAdmins = formatNumber(currentUser?.isAdmin).length;
      const totalBrokers = formatNumber(currentUser?.isBrokers).length ;
      const totalRegularUsers = statsData.totalUsers - totalAdmins - totalBrokers  ;

      setUserStats({
        users: statsData.users || [],
        totalUsers: statsData.totalUsers || 0,
        lastMonthUsers: statsData.lastMonthUsers || 0,
        totalAdmins,
        totalBrokers,
        totalRegularUsers
      });

      if (pagesRes) {
        if (!pagesRes.ok) throw new Error('Failed to fetch pages');
        const pagesData = await pagesRes.json();
        setUserPages(pagesData.listings || []);
      }
    } catch (err) {
      setError(err.message);
      console.error('Dashboard data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = userPages.filter(page =>
    (page.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     page.address?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterAvailable === 'all' || page.available === filterAvailable)
  );

  const chartData = [
    { name: 'Regular Users', value: userStats.totalRegularUsers || 0 },
    { name: 'Admins', value: formatNumber(currentUser?.isAdmin).length || 0 },
    { name: 'Brokers', value: formatNumber(currentUser?.isBrokers).length || 0 }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Dashboard</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <div className={`mt-2 text-2xl font-bold text-${color}-600`}>
            {formatNumber(value)}
          </div>
        </div>
        <div className={`p-4 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-500`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className=" mx-auto px-6 py-6 border-t">
      <div className="flex justify-between items-center mb-6 bg-[#004483]/20 p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          {currentUser?.isAdmin && (
          <button
            onClick={() => setActiveTab('dashboardData')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'dashboardData'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'
            }`}
          >
            Overview
          </button>
           )}
          
            <button
              onClick={() => setActiveTab('pagesFinished')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'pagesFinished'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              Manage Pages
            </button>
          
        </div>
      </div>

      {activeTab === 'pagesFinished' ? (


<div className="space-y-6">
<div className="flex flex-wrap gap-6 items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
  <div className="flex flex-wrap gap-4 items-center">
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search pages..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    
    <select
      value={filterAvailable}
      onChange={(e) => setFilterAvailable(e.target.value)}
      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="all">All Status</option>
      <option value="available">Available</option>
      <option value="not available">Not Available</option>
    </select>

    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="updatedAt">Last Updated</option>
      <option value="name">Name</option>
      <option value="propertySize">Property Size</option>
    </select>
  </div>

  <button
    onClick={fetchDashboardData}
    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
    <RefreshCcw className="w-4 h-4" />
    Refresh
  </button>
</div>

<div className="bg-white rounded-lg shadow-sm border overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Date Updated
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Title
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Location
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {filteredPages.map((page) => (
        <tr key={page._id}>
          <td className="px-6 py-4 whitespace-nowrap">
            {new Date(page.updatedAt).toLocaleDateString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap font-medium">
            {page.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {page.address}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              page.available === 'available'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {page.available}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex gap-2">
              <Link
                to={`/Update-Page/${page._id}`}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Edit
              </Link>
              <Link
                to={`/Projects/${page.slug}`}
                className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                View
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
</div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Regular Users"
              value={userStats.totalRegularUsers}
              icon={User}
              color="blue"
            />
            <StatCard
              title="Total Admins"
              value={formatNumber(currentUser?.isAdmin).length}
              icon={Shield}
              color="green"
            />
            <StatCard
              title="Total Brokers"
              value={formatNumber(currentUser?.Brokers).length}
              icon={Briefcase}
              color="purple"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">User Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatNumber(value), "Count"]}
                  />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Additional Stats */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Additional Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.totalUsers)}</p>
              </div>
              <div>
                <p className="text-gray-600">New Users (Last Month)</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.lastMonthUsers)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardData;