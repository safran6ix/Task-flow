const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Create task
router.post('/', auth, async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        const newTask = new Task({
            user: req.user.id,
            title,
            description,
            status,
            priority,
            dueDate,
        });
        const task = await newTask.save();
        res.json(task);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Update task
router.put('/:id', auth, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

        task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Unauthorized' });

        await task.deleteOne();
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

module.exports = router;