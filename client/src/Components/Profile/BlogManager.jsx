import React, { useEffect, useState } from 'react';
import { Button, Modal, Badge } from "flowbite-react";
import { Link } from "react-router-dom";
import { HiOutlineExclamationCircle, HiPencil, HiPlus, HiTrash } from "react-icons/hi";
import { TbLoaderQuarter } from "react-icons/tb";

export default function BlogManager() {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [blogIdToDelete, setBlogIdToDelete] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/cms/blogs');
            const data = await res.json();
            if (res.ok) {
                setBlogs(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBlog = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/cms/blogs/${blogIdToDelete}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setBlogs(prev => prev.filter(b => b._id !== blogIdToDelete));
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 bg-white dark:bg-gray-800 min-h-screen font-body">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Blog & News Manager</h1>
                    <p className="text-xs text-slate-500 mt-1">Manage your latest news and articles</p>
                </div>
                <Link to="/Admin/Blog-Editor">
                    <Button color="dark" className="rounded-none uppercase tracking-widest font-bold">
                        <HiPlus className="mr-2 h-5 w-5" />
                        Write Article
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
                                <th className="px-6 py-3 font-black tracking-widest">Article Title</th>
                                <th className="px-6 py-3 font-black tracking-widest">Status</th>
                                <th className="px-6 py-3 font-black tracking-widest">Author</th>
                                <th className="px-6 py-3 font-black tracking-widest">Date</th>
                                <th className="px-6 py-3 font-black tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {blogs.map((blog) => (
                                <tr key={blog._id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {blog.title.en} <br />
                                        <span className="text-xs text-slate-400 font-normal">{blog.title.ar}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={blog.status === 'Published' ? 'success' : 'warning'} className="w-fit rounded-none">
                                            {blog.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {blog.author?.name || 'Admin'}
                                    </td>
                                    <td className="px-6 py-4 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <Link to={`/Admin/Blog-Editor/${blog._id}`}>
                                            <Button size="xs" color="gray" className="rounded-none">
                                                <HiPencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button size="xs" color="failure" className="rounded-none" onClick={() => { setBlogIdToDelete(blog._id); setShowModal(true); }}>
                                            <HiTrash className="h-4 w-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {blogs.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-slate-400">No articles found. Start writing!</td>
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
                        Delete this article?
                    </h3>
                    <div className="flex justify-center gap-4">
                        <Button color="failure" onClick={handleDeleteBlog} className="rounded-none font-bold uppercase tracking-widest">
                            Yes, Delete
                        </Button>
                        <Button color="gray" onClick={() => setShowModal(false)} className="rounded-none font-bold uppercase tracking-widest border">
                            Cancel
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
