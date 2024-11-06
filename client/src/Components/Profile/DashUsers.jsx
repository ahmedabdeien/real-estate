import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Modal, Table, Dropdown, TextInput } from "flowbite-react";
import { HiOutlineExclamationCircle, HiSearch, HiOutlineRefresh, HiAdjustments } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import Switch from "react-switch"; 
import { Helmet } from "react-helmet";
export default function DashUsers() {
    const { currentUser } = useSelector(state => state.user);
    const [users, setUsers] = useState([]);
    const [role, setRole] = useState(currentUser.isAdmin ? "admin" : "user");
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [userIdToDelete, setUserIdToDelete] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState('all');
    const [sortBy, setSortBy] = useState('name');
    const [userIdToUpdate, setUserIdToUpdate] = useState(null);
    const [roleChangeModal, setRoleChangeModal] = useState(false);
    const [newRole, setNewRole] = useState('');
    



    
    useEffect(() => {
        if (role === "admin") {
            fetchUsers();
        }
    }, [role]);

    const fetchUsers = async (startIndex = 0) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/user/getusers?startIndex=${startIndex}&sortBy=${sortBy}`);
            const data = await res.json();
            
            if (res.ok) {
                setUsers(prevUsers => startIndex === 0 ? data.users : [...prevUsers, ...data.users]);
                setShowMore(data.users.length === 10); // Assuming API returns 10 users per page
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowMore = () => fetchUsers(users.length);

    const handleDeleteUser = async () => {
        try {
            const res = await fetch(`/api/user/delete/${userIdToDelete}`, { method: "DELETE" });
            if (res.ok) {
                setUsers(prev => prev.filter(user => user._id !== userIdToDelete));
                setShowModal(false);
            } else {
                console.error("Failed to delete user");
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    const handleChangeUserRole = async () => {
      if (!userIdToUpdate || !newRole) return; // Prevent executing if ID or role is not set
      try {
          const res = await fetch(`/api/user/changerole/${userIdToUpdate}`, {
              method: "PUT",
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: newRole }), // Ensure newRole is a valid string
          });
  
          if (!res.ok) {
              const errorData = await res.json();
              console.error("Failed to change user role:", errorData.message);
              throw new Error(errorData.message || "Failed to change user role");
          }
  
          // If the response is successful, update the user list
          const updatedUser = await res.json();
          setUsers(prev => prev.map(user =>
              user._id === userIdToUpdate
                  ? { ...user, ...updatedUser }
                  : user
          ));
          setRoleChangeModal(false); // Close modal after successful update
          setNewRole(''); // Reset newRole state
          setUserIdToUpdate(null); // Reset userIdToUpdate
      } catch (error) {
          console.error("Error changing user role:", error);
      }
  };
  

    const handleToggleUserStatus = async (userId, currentStatus) => {
        try {
            const res = await fetch(`/api/user/togglestatus/${userId}`, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: !currentStatus })
            });
            if (res.ok) {
                setUsers(prev => prev.map(user => 
                    user._id === userId 
                        ? { ...user, isActive: !currentStatus }
                        : user
                ));
            } else {
                console.error("Failed to toggle user status");
            }
        } catch (error) {
            console.error("Error toggling user status:", error);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterRole === 'all' || 
         (filterRole === 'admin' && user.isAdmin) ||
         (filterRole === 'broker' && user.isBroker) ||
         (filterRole === 'user' && !user.isAdmin && !user.isBroker))
    );

    return (
        <>
        <Helmet>
            <title>User Management</title>
        </Helmet>
        <div className="p-4 bg-white dark:bg-gray-800 min-h-screen border-t">
          <div className='bg-[#004483]/20 px-4 py-6 mb-4 rounded-lg'>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
          </div>
            <div className="mb-4 flex flex-wrap gap-2 items-center justify-between p-4 border rounded-lg">
                <div className="flex flex-wrap gap-2 items-center">
                    <Dropdown label={`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`} inline>
                        <Dropdown.Item onClick={() => setRole("admin")}>Admin</Dropdown.Item>
                        <Dropdown.Item onClick={() => setRole("user")}>User</Dropdown.Item>
                    </Dropdown>
                    <TextInput
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={HiSearch}
                    />
                    <Dropdown label="Filter Role" icon={HiAdjustments}>
                        <Dropdown.Item onClick={() => setFilterRole('all')}>All Roles</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilterRole('admin')}>Admin</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilterRole('broker')}>Broker</Dropdown.Item>
                        <Dropdown.Item onClick={() => setFilterRole('user')}>User</Dropdown.Item>
                    </Dropdown>
                    <Dropdown label="Sort By" icon={HiAdjustments}>
                        <Dropdown.Item onClick={() => setSortBy('name')}>Name</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortBy('email')}>Email</Dropdown.Item>
                        <Dropdown.Item onClick={() => setSortBy('createdAt')}>Date Joined</Dropdown.Item>
                    </Dropdown>
                </div>
                {role === "admin" && (
                    <Button color="blue" onClick={() => fetchUsers(0)}>
                        <HiOutlineRefresh className="mr-2" /> Refresh
                    </Button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <TbLoaderQuarter className="text-4xl animate-spin text-blue-500" />
                </div>
            ) : filteredUsers.length > 0 ? (
                <div className="overflow-x-auto border rounded-lg">
                    <Table hoverable>
                        <Table.Head className='border-b'>
                            <Table.HeadCell>User</Table.HeadCell>
                            <Table.HeadCell>Email</Table.HeadCell>
                            <Table.HeadCell>Phone Number</Table.HeadCell>
                            <Table.HeadCell>Role</Table.HeadCell>
                            <Table.HeadCell>Status</Table.HeadCell>
                            {role === "admin" && <Table.HeadCell>Actions</Table.HeadCell>}
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {filteredUsers.map((user) => (
                                <Table.Row key={user._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell className="flex items-center space-x-3">
                                        <img className="w-10 h-10 rounded-full" src={user.avatar} alt={user.name} />
                                        <div>
                                            <div className="font-semibold">{user.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">@{user.username}</div>
                                        </div>
                                    </Table.Cell>
                                    <Table.Cell>{user.email}</Table.Cell>
                                    <Table.Cell>{user.number}</Table.Cell>
                                    <Table.Cell>
                                        <Badge color={user.isAdmin ? "success" : user.isBroker ? "info" : "gray"}>
                                            {user.isAdmin ? "Admin" : user.isBroker ? "Broker" : "User"}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Switch
                                            checked={user.isActive}
                                            onChange={() => handleToggleUserStatus(user._id, user.isActive)}
                                            onColor="#016FB9"
                                            offColor="#d1d5db"
                                        />
                                    </Table.Cell>
                                    {role === "admin" && (
                                        <Table.Cell>
                                            <div className="flex space-x-2">
                                                <Dropdown label="Change Role" inline>
                                                    <Dropdown.Item onClick={() => { setUserIdToUpdate(user._id); setNewRole('admin'); setRoleChangeModal(true); }}>Admin</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => { setUserIdToUpdate(user._id); setNewRole('broker'); setRoleChangeModal(true); }}>Broker</Dropdown.Item>
                                                    <Dropdown.Item onClick={() => { setUserIdToUpdate(user._id); setNewRole('user'); setRoleChangeModal(true); }}>User</Dropdown.Item>
                                                </Dropdown>
                                                <Button color="red" onClick={() => { setUserIdToDelete(user._id); setShowModal(true); }}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    )}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                    {showMore && (
                        <div className="flex justify-center my-3 w-full">
                            <Button color="light" onClick={handleShowMore}>Show More</Button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-10">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search criteria.</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <Modal.Header>Delete User</Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this user?
                        </h3>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button color="red" onClick={handleDeleteUser}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Role Change Confirmation Modal */}
            <Modal show={roleChangeModal} onClose={() => setRoleChangeModal(false)}>
                <Modal.Header>Change User Role</Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-12 w-12 text-yellow-600" />
                        <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to change this user's role to {newRole}?
                        </h3>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button color="gray" onClick={() => setRoleChangeModal(false)}>Cancel</Button>
                    <Button color="yellow" onClick={handleChangeUserRole}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </div>
        </>
    );
}
