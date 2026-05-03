import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiPlus, FiTrash2, FiEdit2, FiFilter } from 'react-icons/fi';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        dueDate: '',
        status: 'todo'
    });

    useEffect(() => {
        if (!user) navigate('/login');
        else fetchTasks();
    }, [user]);

    const fetchTasks = async () => {
        const res = await api.get('/tasks');
        setTasks(res.data);
    };

    const saveTask = async () => {
        if (editingTask) {
            await api.put(`/tasks/${editingTask._id}`, form);
        } else {
            await api.post('/tasks', form);
        }
        setShowModal(false);
        setEditingTask(null);
        setForm({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'todo' });
        fetchTasks();
    };

    const deleteTask = async (id) => {
        if (confirm('Delete this task?')) {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        }
    };

    const updateStatus = async (id, newStatus) => {
        const task = tasks.find(t => t._id === id);
        await api.put(`/tasks/${id}`, { ...task, status: newStatus });
        fetchTasks();
    };

    const openEdit = (task) => {
        setEditingTask(task);
        setForm({
            title: task.title,
            description: task.description,
            priority: task.priority,
            dueDate: task.dueDate?.slice(0, 10) || '',
            status: task.status
        });
        setShowModal(true);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-700';
            case 'Medium': return 'bg-yellow-100 text-yellow-700';
            case 'Low': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100';
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'todo': return <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">To Do</span>;
            case 'in-progress': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">In Progress</span>;
            case 'done': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Done</span>;
            default: return null;
        }
    };

    const filteredTasks = filterStatus === 'all'
        ? tasks
        : tasks.filter(task => task.status === filterStatus);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600">TaskFlow</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">Hi, {user?.name}</span>
                    <button
                        onClick={logout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <div className="p-6">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setForm({ title: '', description: '', priority: 'Medium', dueDate: '', status: 'todo' });
                            setShowModal(true);
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition"
                    >
                        <FiPlus /> Add Task
                    </button>

                    {/* Filter Dropdown */}
                    <div className="flex items-center gap-2">
                        <FiFilter className="text-gray-500" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded-lg px-3 py-2 bg-white"
                        >
                            <option value="all">All Tasks</option>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 font-semibold text-gray-600">Title</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Description</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Priority</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Due Date</th>
                                <th className="text-left p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-8 text-gray-500">
                                        No tasks yet. Click "Add Task" to create one!
                                    </td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr key={task._id} className="border-b hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium">{task.title}</td>
                                        <td className="p-4 text-gray-600">{task.description || '—'}</td>
                                        <td className="p-4">
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateStatus(task._id, e.target.value)}
                                                className="border rounded px-2 py-1 text-sm bg-white"
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="done">Done</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEdit(task)}
                                                    className="text-blue-500 hover:text-blue-700"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => deleteTask(task._id)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>

                        <input
                            className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Title *"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            required
                        />

                        <textarea
                            className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Description"
                            rows="3"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />

                        <select
                            className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={form.priority}
                            onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        >
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>

                        <input
                            type="date"
                            className="w-full p-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={form.dueDate}
                            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                        />

                        <select
                            className="w-full p-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                        >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                        </select>

                        <div className="flex gap-3">
                            <button
                                onClick={saveTask}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-indigo-700 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}