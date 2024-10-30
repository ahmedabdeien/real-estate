import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Modal, Table, TextInput, Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch, HiAdjustments, HiRefresh } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { Helmet } from "react-helmet";
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
            const res = await fetch(`/api/listing/getPages?userId=${currentUser._id}&startIndex=${startIndex}&sortBy=${sortBy}`);
            const data = await res.json();
            
            if (res.ok) {
                setUserPages(prevPages => startIndex === 0 ? data.listings : [...prevPages, ...data.listings]);
                setShowMore(data.listings.length === 10);
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
                console.error("Failed to delete page");
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
            <title>Pages Manage  | Property Finder</title>
        </Helmet>
        <div className="p-4  dark:bg-gray-800 min-h-screen border-t">
            <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Manage Pages</h1>
            
            <div className="mb-4 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                    <div className="relative">
                        <TextInput
                            type="text"
                            placeholder="Search pages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={HiSearch}
                        />
                    </div>
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
                <div className="overflow-x-auto shadow-md rounded-lg">
                    <Table hoverable>
                        <Table.Head>
                            <Table.HeadCell>Date Updated</Table.HeadCell>
                            <Table.HeadCell>Title</Table.HeadCell>
                            <Table.HeadCell>Location</Table.HeadCell>
                            <Table.HeadCell>Status</Table.HeadCell>
                            <Table.HeadCell>Floors</Table.HeadCell>
                            <Table.HeadCell>Size (m²)</Table.HeadCell>
                            <Table.HeadCell>Images</Table.HeadCell>
                            <Table.HeadCell>Actions</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {filteredPages.map((page) => (
                                <Table.Row key={page._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                                    <Table.Cell>{new Date(page.updatedAt).toLocaleDateString()}</Table.Cell>
                                    <Table.Cell className="font-medium text-gray-900 dark:text-white">{page.name}</Table.Cell>
                                    <Table.Cell>{page.address}</Table.Cell>
                                    <Table.Cell>
                                        <Badge color={page.available === 'available' ? "success" : "failure"}>
                                            {page.available}
                                        </Badge>
                                    </Table.Cell>
                                    <Table.Cell>{page.numberFloors}</Table.Cell>
                                    <Table.Cell>{page.propertySize}</Table.Cell>
                                    <Table.Cell>
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
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div className="flex space-x-2">
                                            <Link to={`/Update-Page/${page._id}`}>
                                                <Button size="sm" color="info">Edit</Button>
                                            </Link>
                                            <Button size="sm" color="failure" onClick={() => {
                                                setShowModal(true);
                                                setPageIdToDelete(page._id);
                                            }}>
                                                Delete
                                            </Button>
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