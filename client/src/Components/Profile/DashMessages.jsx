import React, { useEffect, useState } from 'react';
import { Table, Button, Badge, Modal } from 'flowbite-react';
import { HiTrash, HiExclamationCircle, HiEye, HiUser, HiPhone, HiMail } from 'react-icons/hi';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

export default function DashMessages() {
    const { t } = useTranslation();
    const { currentUser } = useSelector((state) => state.user);
    const [messages, setMessages] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [messageIdToDelete, setMessageIdToDelete] = useState('');
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch('/api/cms/messages');
                const data = await res.json();
                if (res.ok) {
                    setMessages(data);
                }
            } catch (error) {
                console.log(error.message);
            }
        };
        if (currentUser.isAdmin || currentUser.role === 'Sales') {
            fetchMessages();
        }
    }, [currentUser._id]);

    const handleDeleteMessage = async () => {
        setShowModal(false);
        try {
            const res = await fetch(`/api/cms/messages/${messageIdToDelete}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (!res.ok) {
                console.log(data.message);
            } else {
                setMessages((prev) => prev.filter((msg) => msg._id !== messageIdToDelete));
            }
        } catch (error) {
            console.log(error.message);
        }
    };

    const handleOpenDetail = (msg) => {
        setSelectedMessage(msg);
        setShowDetailModal(true);
    };

    return (
        <div className='table-auto overflow-x-scroll md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Inbox</h1>
            {currentUser.isAdmin || currentUser.role === 'Sales' ? (
                <>
                    {messages.length > 0 ? (
                        <Table hoverable className='shadow-md'>
                            <Table.Head>
                                <Table.HeadCell>Date</Table.HeadCell>
                                <Table.HeadCell>Sender Name</Table.HeadCell>
                                <Table.HeadCell>Message Preview</Table.HeadCell>
                                <Table.HeadCell>Email</Table.HeadCell>
                                <Table.HeadCell>Actions</Table.HeadCell>
                            </Table.Head>
                            <Table.Body className='divide-y'>
                                {messages.map((msg) => (
                                    <Table.Row key={msg._id} className='bg-white dark:border-gray-700 dark:bg-gray-800'>
                                        <Table.Cell>
                                            {new Date(msg.createdAt).toLocaleDateString()}
                                        </Table.Cell>
                                        <Table.Cell className='font-medium text-gray-900 dark:text-white'>
                                            {/* Contact model uses fullName, Message model might use username/sender object. 
                            Based on Contact model inspection, it is fullName */}
                                            {msg.fullName || 'No Name'}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {msg.message?.substring(0, 50)}...
                                        </Table.Cell>
                                        <Table.Cell>{msg.email}</Table.Cell>
                                        <Table.Cell>
                                            <div className="flex gap-2">
                                                <Button size="xs" gradientMonochrome="info" onClick={() => handleOpenDetail(msg)}>
                                                    <HiEye className="mr-1 h-4 w-4" /> View
                                                </Button>
                                                <Button size="xs" gradientMonochrome="failure" onClick={() => {
                                                    setShowModal(true);
                                                    setMessageIdToDelete(msg._id);
                                                }}>
                                                    Delete
                                                </Button>
                                            </div>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table>
                    ) : (
                        <p>You have no new messages</p>
                    )}
                </>
            ) : (
                <p>You have no specific messages</p>
            )}

            {/* Delete Confirmation */}
            <Modal show={showModal} onClose={() => setShowModal(false)} popup size='md'>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <HiTrash className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                            Are you sure you want to delete this message?
                        </h3>
                        <div className='flex justify-center gap-4'>
                            <Button color='failure' onClick={handleDeleteMessage}>
                                Yes, I'm sure
                            </Button>
                            <Button color='gray' onClick={() => setShowModal(false)}>
                                No, cancel
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Detail View */}
            {selectedMessage && (
                <Modal show={showDetailModal} onClose={() => setShowDetailModal(false)} size='xl'>
                    <Modal.Header>Message Details</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 border-b pb-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                    <HiUser size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedMessage.fullName}</h3>
                                    <div className="text-gray-500 text-sm flex gap-4">
                                        <span className="flex items-center gap-1"><HiMail /> {selectedMessage.email}</span>
                                        <span className="flex items-center gap-1"><HiPhone /> {selectedMessage.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg text-gray-700 leading-relaxed">
                                {selectedMessage.message}
                            </div>
                            <div className="text-xs text-gray-400 text-right">
                                Recieved: {new Date(selectedMessage.createdAt).toLocaleString()}
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button color="gray" onClick={() => setShowDetailModal(false)}>
                            Close
                        </Button>
                        <a href={`mailto:${selectedMessage.email}`} className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
                            Reply via Email
                        </a>
                    </Modal.Footer>
                </Modal>
            )}
        </div>
    );
}
