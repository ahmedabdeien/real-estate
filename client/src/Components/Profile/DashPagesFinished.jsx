import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Badge, Button, Modal, TextInput, Dropdown } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiSearch, HiAdjustments, HiRefresh } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";
import { Helmet } from "react-helmet";

// Reusable Table Component with Sharp Edges
const Table = ({ children }) => (
    <div className="overflow-x-auto rounded-none border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {children}
        </table>
    </div>
);

const TableHead = ({ children }) => (
    <thead className="bg-slate-50 dark:bg-gray-800 border-b-2 border-slate-200">
        <tr>{children}</tr>
    </thead>
);

const TableHeaderCell = ({ children }) => (
    <th className="px-6 py-4 text-left text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50">
        {children}
    </th>
);

const TableBody = ({ children }) => (
    <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
        {children}
    </tbody>
);

const TableRow = ({ children }) => (
    <tr className="hover:bg-slate-50 transition-colors duration-200">{children}</tr>
);

const TableCell = ({ children, className = '' }) => (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 dark:text-gray-100 ${className}`}>
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
            const res = await fetch(`/api/listing/getListings?limit=1000&startIndex=${startIndex}&sortBy=${sortBy}`);
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

    const filteredPages = userPages.filter(page => {
        const nameMatch = (typeof page.name === 'object' ? (page.name.en || page.name.ar || '') : (page.name || '')).toLowerCase().includes(searchTerm.toLowerCase());
        const addressMatch = (typeof page.address === 'object' ? (page.address.en || page.address.ar || '') : (page.address || '')).toLowerCase().includes(searchTerm.toLowerCase());
        return (nameMatch || addressMatch) && (filterAvailable === 'all' || page.available === filterAvailable);
    });

    const handleRefresh = () => {
        setUserPages([]);
        fetchPages(0);
    };

    return (
        <>
            <Helmet>
                <title>Projects Management | Admin Dashboard</title>
            </Helmet>
            <div className="p-6 bg-white dark:bg-gray-800 min-h-screen">
                <div className='bg-primary-900 px-8 py-10 mb-8 rounded-none border-b-4 border-accent-500'>
                    <h1 className="text-3xl font-black text-white uppercase tracking-widest">المشاريع العقارية</h1>
                    <p className="text-primary-200 mt-2 font-medium">إدارة وتحديث كافة الوحدات والمشاريع المدرجة في النظام</p>
                </div>

                <div className="mb-8 flex flex-wrap gap-4 items-center justify-between p-6 bg-slate-50 border border-slate-200 rounded-none">
                    <div className="flex flex-wrap gap-4 items-center ">
                        <div className="relative">
                            <TextInput
                                type="text"
                                placeholder="Search by name or site..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-80"
                                icon={HiSearch}
                                theme={{ field: { input: { base: "rounded-none", colors: { gray: "bg-white border-slate-200" } } } }}
                            />
                        </div>
                        <Dropdown label={`Status: ${filterAvailable}`} inline className="rounded-none">
                            <Dropdown.Item onClick={() => setFilterAvailable('all')}>All</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterAvailable('available')}>Available</Dropdown.Item>
                            <Dropdown.Item onClick={() => setFilterAvailable('not available')}>Not Available</Dropdown.Item>
                        </Dropdown>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        className="bg-primary-600 hover:bg-primary-700 text-white rounded-none transition-all uppercase tracking-widest font-bold text-xs px-4"
                    >
                        <HiRefresh className="mr-2 h-4 w-4" />
                        Refresh Data
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-96 space-y-4">
                        <TbLoaderQuarter className="text-6xl animate-spin text-primary-600" />
                        <p className="font-bold text-slate-400 animate-pulse">جاري تحميل البيانات...</p>
                    </div>
                ) : filteredPages.length > 0 ? (
                    <Table>
                        <TableHead>
                            <TableHeaderCell>Details</TableHeaderCell>
                            <TableHeaderCell>Financials</TableHeaderCell>
                            <TableHeaderCell>Specifications</TableHeaderCell>
                            <TableHeaderCell>Broker Info</TableHeaderCell>
                            <TableHeaderCell>Status</TableHeaderCell>
                            <TableHeaderCell>Images</TableHeaderCell>
                            <TableHeaderCell>Actions</TableHeaderCell>
                        </TableHead>
                        <TableBody>
                            {filteredPages.map((page) => (
                                <TableRow key={page._id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-900 text-sm uppercase">
                                                {typeof page.name === 'object' ? (page.name.en || page.name.ar) : page.name}
                                            </span>
                                            <span className="text-[11px] text-slate-500 mt-1 italic">
                                                {typeof page.address === 'object' ? (page.address.en || page.address.ar) : page.address}
                                            </span>
                                            <span className="text-[10px] text-primary-600 mt-2 font-bold">
                                                Updated: {new Date(page.updatedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-500">Regular Price:</span>
                                            <span className="text-sm font-black text-accent-600">${page.regularPrice?.toLocaleString()}</span>
                                            {page.discountPrice > 0 && (
                                                <>
                                                    <span className="text-[10px] text-red-500 line-through">Off: ${page.discountPrice?.toLocaleString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <span className="text-slate-400">Size:</span>
                                            <span className="font-bold">{page.propertySize} m²</span>
                                            <span className="text-slate-400">Floors:</span>
                                            <span className="font-bold">{page.numberFloors}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Badge color="info" className="rounded-none w-fit text-[9px] uppercase font-black mb-1">
                                                {page.type || 'Standard'}
                                            </Badge>
                                            <span className="text-[11px] text-slate-500">ID: {page._id.slice(-6)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${page.available === 'available'
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                            }`}>
                                            {page.available}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex -space-x-4 shadow-sm">
                                            {page.imageUrls.slice(0, 3).map((image, index) => (
                                                <img key={index} className="w-10 h-10 rounded-none border-2 border-white object-cover shadow-sm bg-slate-100" src={image} alt="Unit" />
                                            ))}
                                            {page.imageUrls.length > 3 && (
                                                <div className="flex items-center justify-center w-10 h-10 text-[xs] font-black text-white bg-primary-900 border-2 border-white">
                                                    +{page.imageUrls.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <Link to={`/Update-Page/${page._id}`} className="flex-1">
                                                    <button className='w-full bg-slate-900 text-white hover:bg-black py-2 rounded-none text-[10px] font-black uppercase tracking-tighter transition-all'>Edit</button>
                                                </Link>
                                                <Link to={`/Projects/${page.slug}`} className="flex-1">
                                                    <button className='w-full bg-accent-500 text-white hover:bg-accent-600 py-2 rounded-none text-[10px] font-black uppercase tracking-tighter transition-all'>View</button>
                                                </Link>
                                            </div>
                                            <button
                                                className='w-full bg-red-50 text-red-600 hover:bg-red-600 hover:text-white py-2 rounded-none text-[10px] font-black uppercase tracking-tighter transition-all border border-red-100'
                                                onClick={() => { setShowModal(true); setPageIdToDelete(page._id); }}
                                            >
                                                Delete Unit
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-24 bg-slate-50 border border-dashed border-slate-300">
                        <HiOutlineExclamationCircle className="mx-auto h-16 w-16 text-slate-300 mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active projects found</h3>
                        <p className="text-slate-500">Try adjusting your filters or search keywords.</p>
                    </div>
                )}

                <div className="mt-12 flex justify-between items-center bg-slate-50 p-6 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Results: {filteredPages.length}</p>
                    {showMore && (
                        <Button color="dark" onClick={handleShowMore} className="rounded-none uppercase tracking-widest font-black text-xs px-10 border-2">
                            Load More Data
                        </Button>
                    )}
                </div>

                <Modal show={showModal} size="md" onClose={() => setShowModal(false)} popup className="rounded-none">
                    <Modal.Header />
                    <Modal.Body className="bg-white p-10 rounded-none">
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-6 h-20 w-20 text-red-500" />
                            <h3 className="mb-6 text-2xl font-black text-slate-900 uppercase">
                                Confirm Deletion
                            </h3>
                            <p className="text-slate-500 mb-10 text-sm">
                                Are you sure you want to permanently delete this project? This action cannot be undone.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Button color="failure" onClick={handleDeletePage} className="rounded-none uppercase tracking-widest font-black flex-1 py-4">
                                    Yes, Delete Now
                                </Button>
                                <Button color="gray" onClick={() => setShowModal(false)} className="rounded-none uppercase tracking-widest font-black flex-1 py-4 border-2">
                                    No, Keep It
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
            </div>
        </>
    );
}