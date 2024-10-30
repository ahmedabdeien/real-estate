import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { Badge, Button, Card, Table, TextInput, Dropdown, Alert } from 'flowbite-react';
import { HiSearch, HiAdjustments, HiRefresh } from 'react-icons/hi';
import { FaUsers, FaUserShield, FaUserTie } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Helmet } from "react-helmet";
const DashbordData = () => {
  const { currentUser } = useSelector((state) => state.user);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboardData');
  const [userStats, setUserStats] = useState({ totalUsers: 0, totalAdmins: 0, totalBrokers: 0 });
  const [userPages, setUserPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAvailable, setFilterAvailable] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab) setActiveTab(tab);
    fetchDashboardData();
  }, [location]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch user stats
      const statsRes = await fetch(`/api/user/getusers`);
      const statsData = await statsRes.json();
      if (statsRes.ok) {
        setUserStats(statsData);
      } else {
        throw new Error(statsData.message || 'Failed to fetch user stats');
      }

      // Fetch pages if user is admin
      if (currentUser.isAdmin) {
        const pagesRes = await fetch(`/api/listing/getPages?userId=${currentUser._id}&sortBy=${sortBy}`);
        const pagesData = await pagesRes.json();
        if (pagesRes.ok) {
          setUserPages(pagesData.listings);
        } else {
          throw new Error(pagesData.message || 'Failed to fetch pages');
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPages = userPages.filter(page =>
    (page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterAvailable === 'all' || page.available === filterAvailable)
  );

  const chartData = [
    { name: 'Users', value: userStats.totalUsers },
    { name: 'Admins', value: userStats.totalAdmins },
    { name: 'Brokers', value: userStats.totalBrokers },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboardData':
        return (
          <div className="space-y-6 ">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Users" value={userStats.totalUsers} icon={<FaUsers />} color="blue" />
              <StatCard title="Total Admins" value={userStats.totalAdmins} icon={<FaUserShield />} color="green" />
              <StatCard title="Total Brokers" value={userStats.totalBrokers} icon={<FaUserTie />} color="cyan" />
            </div>
            <Card>
              <h2 className="text-2xl font-bold mb-4">User Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        );
      case 'pagesFinished':
        return (
          <div>
            <div className="mb-4 flex flex-wrap gap-2 items-center justify-between ">
              <div className="flex flex-wrap gap-2 items-center">
                <TextInput
                  type="text"
                  placeholder="Search pages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={HiSearch}
                />
                <Dropdown label="Filter" icon={HiAdjustments}>
                  <Dropdown.Item onClick={() => setFilterAvailable('all')}>All</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterAvailable('available')}>Available</Dropdown.Item>
                  <Dropdown.Item onClick={() => setFilterAvailable('not available')}>Not Available</Dropdown.Item>
                </Dropdown>
                <Dropdown label="Sort By" icon={HiAdjustments}>
                  <Dropdown.Item onClick={() => setSortBy('updatedAt')}>Last Updated</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('name')}>Name</Dropdown.Item>
                  <Dropdown.Item onClick={() => setSortBy('propertySize')}>Property Size</Dropdown.Item>
                </Dropdown>
              </div>
              <Button color="blue" onClick={fetchDashboardData}>
                <HiRefresh className="mr-2 h-5 w-5" />
                Refresh
              </Button>
            </div>
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Date Updated</Table.HeadCell>
                <Table.HeadCell>Title</Table.HeadCell>
                <Table.HeadCell>Location</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {filteredPages.map((page) => (
                  <Table.Row key={page._id}>
                    <Table.Cell>{new Date(page.updatedAt).toLocaleDateString()}</Table.Cell>
                    <Table.Cell className="font-medium">{page.name}</Table.Cell>
                    <Table.Cell>{page.address}</Table.Cell>
                    <Table.Cell>
                      <Badge color={page.available === 'available' ? "success" : "failure"}>
                        {page.available}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex space-x-2">
                        <Link to={`/Update-Page/${page._id}`}>
                          <Button size="sm">Edit</Button>
                        </Link>
                        <Link to={`/Projects/${page.slug}`}>
                          <Button size="sm" color="success">View</Button>
                        </Link>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        );
      default:
        return <div>Select a tab</div>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <>
    <Helmet>
      <title>Dashboard | Real Estate Agency</title>
    </Helmet>
    <div className="container mx-auto px-4 py-8 border-t">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex mb-6">
        <Button
          color={activeTab === 'dashboardData' ? 'blue' : 'gray'}
          onClick={() => setActiveTab('dashboardData')}
          className="mr-2"
        >
          Overview
        </Button>
        {currentUser.isAdmin && (
          <Button
            color={activeTab === 'pagesFinished' ? 'blue' : 'gray'}
            onClick={() => setActiveTab('pagesFinished')}
          >
            Manage Pages
          </Button>
        )}
      </div>
      {renderTabContent()}
    </div>
    </>
  );
};
export default DashbordData;

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">{title}</h2>
        <Badge color={color} size="xl" className="mt-2">{value}</Badge>
      </div>
      {React.cloneElement(icon, { className: `text-4xl text-${color}-500 dark:text-${color}-400` })}
    </div>
  </Card>
);

