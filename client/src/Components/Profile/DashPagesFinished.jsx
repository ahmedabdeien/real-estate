import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Modal, TextInput, Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch, HiAdjustments, HiRefresh } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { Helmet } from "react-helmet";

// Reusable Table Component
const Table = ({ children }) => (
    <div className="overflow-x-auto rounded-lg border">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </table>
    </div>
);

const TableHead = ({ children }) => (
    <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>{children}</tr>
    </thead>
);

const TableHeaderCell = ({ children }) => (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        {children}
    </th>
);

const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
        {children}
    </tbody>
);

const TableRow = ({ children }) => (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">{children}</tr>
);

const TableCell = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${className}`}>
        {children}
    </td>
);

export default function DashPagesFinished() {
    const { currentUser } = useSelector(state => state.user);
    const [userPages, setUserPages] = useState([]);
    const [showMore, setShowMore] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [pageIdToDelete, setPageIdToDelete] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAvailable, setFilterAvailable] = useState('all');
    const [sortBy, setSortBy] = useState('updatedAt');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (currentUser.isAdmin) {
            fetchPages();
        }
    }, [currentUser.isAdmin, currentUser._id]);

    const fetchPages = async (startIndex = 0) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/listing/getPages?limit=1000&startIndex=${startIndex}&sortBy=${sortBy}`);
            const data = await res.json();
            
            if (res.ok) {
                setUserPages(prevPages => startIndex === 0 ? data.listings : [...prevPages, ...data.listings]);
                setShowMore(data.listings.length === 8);
            } else {
                console.error("Failed to fetch pages:", res.statusText);
            }
        } catch (error) {
            console.error("Error fetching pages:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleShowMore = () => fetchPages(userPages.length);

    const handleDeletePage = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/listing/deletePage/${pageIdToDelete}/${currentUser._id}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setUserPages(prev => prev.filter(page => page._id !== pageIdToDelete));
            } else {
                console.error("Failed to delete page:", res.statusText);
            }
        } catch (error) {
            console.error("Error deleting page:", error);
        }
    };

    const filteredPages = userPages.filter(page =>
        (page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         page.address.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterAvailable === 'all' || page.available === filterAvailable)
    );

    const handleRefresh = () => {
        setUserPages([]);
        fetchPages(0);
    };

    return (
        <>
            <Helmet>
                <title>Pages Manage | Property Finder</title>
            </Helmet>
            <div className="p-4 dark:bg-gray-800 min-h-screen border-t">
                <div className='bg-[#004483]/20 px-4 py-6 mb-4 rounded-lg'>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manage Pages</h1>
                </div>
                
                <div className="mb-4 flex flex-wrap gap-4 items-center justify-between p-4 border rounded-lg">
                    <div className="flex flex-wrap gap-2 items-center ">
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
                    <Button color="blue" onClick={handleRefresh}>
                        <HiRefresh className="mr-2 h-5 w-5" />
                        Refresh
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <TbLoaderQuarter className="text-4xl animate-spin text-blue-500" />
                    </div>
                ) : filteredPages.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableHeaderCell>Date Updated</TableHeaderCell>
                            <TableHeaderCell>Title</TableHeaderCell>
                            <TableHeaderCell>Location</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Floors</TableHeaderCell>
                            <TableHeaderCell>Size (m²)</TableHeaderCell>
                            <TableHeaderCell>Images</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableHead>
                        <TableBody>
                            {filteredPages.map((page) => (
                                <TableRow key={page._id}>
                                    <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="font-medium text-gray-900 dark:text-white bg-gray-50">{page.name}</TableCell>
                                    <TableCell>{page.address}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            page.available === 'available'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                            {page.available}
                                        </span>
                                    </TableCell>
                                    <TableCell>{page.numberFloors}</TableCell>
                                    <TableCell>{page.propertySize}</TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-5 w-28">
                                            {page.imageUrls.slice(0, 3).map((image, index) => (
                                                <img key={index} className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800" src={image} alt={`Page image ${index + 1}`} />
                                            ))}
                                            {page.imageUrls.length > 3 && (
                                                <div className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 rounded-full border-2 border-white hover:bg-gray-600 dark:border-gray-800">
                                                    +{page.imageUrls.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Link to={`/Update-Page/${page._id}`}>
                                                <button className='bg-blue-100 text-blue-600 hover:bg-blue-200 px-6 py-2 rounded-md'>Edit</button>
                                            </Link>
                                            <button className='bg-red-100 text-red-600 hover:bg-red-200 px-6 py-2 rounded-md' onClick={() => {setShowModal(true); setPageIdToDelete(page._id);}}>Delete</button>
                                            <Link to={`/Projects/${page.slug}`}>
                                                <button className='bg-green-100 text-green-600 hover:bg-green-200 px-6 py-2 rounded-md'>View</button>
                                            </Link>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-gray-500 dark:text-gray-400">No pages found</p>
                    </div>
                )}

                {showMore && (
                    <div className="mt-4 flex justify-center">
                        <Button color="light" onClick={handleShowMore}>
                            Load More
                        </Button>
                    </div>
                )}

                <Modal show={showModal} size="md" onClose={() => setShowModal(false)} popup>
                    <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete this page?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button color="failure" onClick={handleDeletePage}>
                                    Yes, delete it
                                </Button>
                                <Button color="gray" onClick={() => setShowModal(false)}>
                                    No, cancel
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
}