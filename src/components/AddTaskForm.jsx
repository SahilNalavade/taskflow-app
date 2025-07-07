import { useState } from 'react';
import { Plus } from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Done', 'Blocked'];

export default function AddTaskForm({ onAddTask, loading }) {
  const [task, setTask] = useState('');
  const [status, setStatus] = useState('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!task.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask(task, status);
      setTask('');
      setStatus('Pending');
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-2">
            Task Description
          </label>
          <textarea
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter task description..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            required
          />
        </div>
        <div className="md:w-48">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </form>
  );
}