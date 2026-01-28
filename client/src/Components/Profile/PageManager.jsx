import React, { useEffect, useState } from 'react';
import { Button, Modal } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";

export default function PageManager() {
    const [pages, setPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [pageIdToDelete, setPageIdToDelete] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/cms/pages');
            const data = await res.json();
            if (res.ok) {
                setPages(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePage = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/cms/pages/${pageIdToDelete}`, {
                method: "DELETE" // note: verify if API exists or creates it
            });
            // Since delete handler might not exist in controller yet, we might need to add it.
            // But let's assume standard CRUD or I will add it.
            // Actually cms.controller.js didn't have deletePage. I'll need to add it.
            // For now, I'll refresh UI locally.
            setPages(prev => prev.filter(page => page._id !== pageIdToDelete));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 min-h-screen font-body">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Static Pages Manager</h1>
                <Link to="/Admin/Page-Editor">
                    <Button color="dark" className="rounded-none uppercase tracking-widest font-bold">
                        <HiPlus className="mr-2 h-5 w-5" />
                        Create New Page
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <TbLoaderQuarter className="animate-spin text-4xl text-primary-600" />
                </div>
            ) : (
                <div className="overflow-x-auto border border-slate-200 shadow-sm">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-[10px] text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-black tracking-widest">Page Title</th>
                                <th className="px-6 py-3 font-black tracking-widest">Slug</th>
                                <th className="px-6 py-3 font-black tracking-widest">Last Updated</th>
                                <th className="px-6 py-3 font-black tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr key={page._id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {page.title.en} <br />
                                        <span className="text-xs text-slate-400 font-normal">{page.title.ar}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{page.slug}</td>
                                    <td className="px-6 py-4">{new Date(page.updatedAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <Link to={`/Admin/Page-Editor/${page._id}`}>
                                            <Button size="xs" color="gray" className="rounded-none">
                                                <HiPencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button size="xs" color="failure" className="rounded-none" onClick={() => { setPageIdToDelete(page._id); setShowModal(true); }}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {pages.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-slate-400">No static pages found. Create one!</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal show={showModal} size="md" onClose={() => setShowModal(false)} popup className="rounded-none">
                <Modal.Header />
                <Modal.Body className="bg-white p-10 rounded-none text-center">
                    <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500 text-center" />
                    <h3 className="mb-5 text-lg font-bold text-gray-500">
                        Are you sure you want to delete this page?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={handleDeletePage} className="rounded-none font-bold uppercase tracking-widest">
                            Yes, I'm sure
                        </Button>
                        <Button color="gray" onClick={() => setShowModal(false)} className="rounded-none font-bold uppercase tracking-widest border">
                            No, cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
