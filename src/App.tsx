import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Flag, Trash2, Edit2, Check, X, Sun, Moon, Download, Upload, Target, TrendingUp } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  isRepeating: boolean;
  completedToday?: boolean;
}

interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedToday: boolean;
  completedDates: string[];
  lastCompleted?: string;
  createdAt: string;
}

const priorityColors = {
  Low: 'bg-green-100 text-green-800 border-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  High: 'bg-red-100 text-red-800 border-red-200'
};

const priorityValues = { Low: 1, Medium: 2, High: 3 };

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'tasks' | 'habits'>('tasks');
  const [newTask, setNewTask] = useState('');
  const [newHabit, setNewHabit] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority'>('dueDate');
  const [habitFrequency, setHabitFrequency] = useState<'daily' | 'weekly'>('daily');

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    const savedHabits = localStorage.getItem('habits');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    
    // Check for daily reset
    checkDailyReset();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastReset');
    
    if (lastReset !== today) {
      // Reset repeating tasks
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks);
        const resetTasks = parsedTasks.map((task: Task) => ({
          ...task,
          completed: task.isRepeating ? false : task.completed,
          completedToday: false
        }));
        setTasks(resetTasks);
      }
      
      // Reset habits
      const savedHabits = localStorage.getItem('habits');
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits);
        const resetHabits = parsedHabits.map((habit: Habit) => ({
          ...habit,
          completedToday: false
        }));
        setHabits(resetHabits);
      }
      
      localStorage.setItem('lastReset', today);
    }
  };

  const addTask = () => {
    if (newTask.trim()) {
      const task: Task = {
        id: Date.now().toString(),
        text: newTask,
        completed: false,
        priority: 'Medium',
        isRepeating: false
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit,
        frequency: habitFrequency,
        streak: 0,
        completedToday: false,
        completedDates: [],
        createdAt: new Date().toISOString()
      };
      setHabits([...habits, habit]);
      setNewHabit('');
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updates } : task));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(habit => habit.id !== id));
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setHabits(habits.map(habit => {
      if (habit.id === id) {
        const wasCompleted = habit.completedToday;
        const newCompletedDates = wasCompleted 
          ? habit.completedDates.filter(date => date !== today)
          : [...habit.completedDates, today];
        
        let newStreak = habit.streak;
        if (!wasCompleted) {
          // Check if this continues a streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          if (habit.completedDates.includes(yesterdayStr) || habit.streak === 0) {
            newStreak = habit.streak + 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = Math.max(0, habit.streak - 1);
        }
        
        return {
          ...habit,
          completedToday: !wasCompleted,
          completedDates: newCompletedDates,
          streak: newStreak,
          lastCompleted: !wasCompleted ? today : habit.lastCompleted
        };
      }
      return habit;
    }));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortBy === 'priority') {
      return priorityValues[b.priority] - priorityValues[a.priority];
    } else {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
  });

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date(new Date().toDateString());
  };

  const exportData = () => {
    const data = { tasks, habits };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'productivity-data.json';
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.tasks) setTasks(data.tasks);
          if (data.habits) setHabits(data.habits);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const completedHabitsToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completedTasksToday = tasks.filter(t => t.completed && !t.isRepeating).length;
  const totalActiveTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-sm border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="w-6 h-6" />
              ProductiveLife
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex gap-2">
                <button onClick={exportData} className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <label className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="text-sm opacity-75">Tasks Active</div>
              <div className="text-2xl font-bold text-blue-500">{totalActiveTasks}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="text-sm opacity-75">Completed Today</div>
              <div className="text-2xl font-bold text-green-500">{completedTasksToday}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="text-sm opacity-75">Habits Done</div>
              <div className="text-2xl font-bold text-purple-500">{completedHabitsToday}/{totalHabits}</div>
            </div>
            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
              <div className="text-sm opacity-75">Best Streak</div>
              <div className="text-2xl font-bold text-orange-500">{Math.max(...habits.map(h => h.streak), 0)}</div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-blue-500 text-white shadow-md'
                  : darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-100'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setActiveTab('habits')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'habits'
                  ? 'bg-blue-500 text-white shadow-md'
                  : darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700' 
                    : 'bg-white hover:bg-gray-100'
              }`}
            >
              Habits
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'tasks' ? (
          <div className="space-y-6">
            {/* Add Task */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="What needs to be done?"
                  className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addTask}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Task Controls */}
            <div className="flex gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'dueDate' | 'priority')}
                className={`px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 ${
                  darkMode 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <option value="dueDate">Sort by Due Date</option>
                <option value="priority">Sort by Priority</option>
              </select>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              {sortedTasks.map(task => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl shadow-sm border-l-4 transition-all duration-200 ${
                    task.completed ? 'opacity-75' : ''
                  } ${
                    task.priority === 'High' ? 'border-red-500' :
                    task.priority === 'Medium' ? 'border-yellow-500' : 
                    'border-green-500'
                  } ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } ${
                    isOverdue(task.dueDate) && !task.completed ? 'ring-2 ring-red-300' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateTask(task.id, { completed: !task.completed })}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {task.completed && <Check className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1">
                      {editingTask === task.id ? (
                        <input
                          type="text"
                          value={task.text}
                          onChange={(e) => updateTask(task.id, { text: e.target.value })}
                          onBlur={() => setEditingTask(null)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') setEditingTask(null);
                          }}
                          className={`w-full px-2 py-1 rounded border ${
                            darkMode 
                              ? 'bg-gray-700 border-gray-600' 
                              : 'bg-white border-gray-300'
                          }`}
                          autoFocus
                        />
                      ) : (
                        <span className={`${task.completed ? 'line-through' : ''}`}>
                          {task.text}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                            isOverdue(task.dueDate) && !task.completed
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {task.isRepeating && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            Repeating
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <select
                        value={task.priority}
                        onChange={(e) => updateTask(task.id, { priority: e.target.value as Task['priority'] })}
                        className={`text-xs px-2 py-1 rounded border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      
                      <input
                        type="date"
                        value={task.dueDate || ''}
                        onChange={(e) => updateTask(task.id, { dueDate: e.target.value })}
                        className={`text-xs px-2 py-1 rounded border ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                      
                      <button
                        onClick={() => updateTask(task.id, { isRepeating: !task.isRepeating })}
                        className={`p-1 rounded ${
                          task.isRepeating
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                        title="Toggle repeating"
                      >
                        🔄
                      </button>
                      
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="p-1 text-blue-500 hover:bg-blue-100 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-4xl mb-4">📝</div>
                  <p className="opacity-75">No tasks yet. Add one above to get started!</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Habit */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Add New Habit</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newHabit}
                  onChange={(e) => setNewHabit(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                  placeholder="What habit do you want to build?"
                  className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <select
                  value={habitFrequency}
                  onChange={(e) => setHabitFrequency(e.target.value as 'daily' | 'weekly')}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <button
                  onClick={addHabit}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Habit List */}
            <div className="space-y-3">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`p-4 rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          habit.completedToday
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {habit.completedToday && <Check className="w-5 h-5" />}
                      </button>
                      
                      <div>
                        <h3 className="font-medium">{habit.name}</h3>
                        <div className="flex items-center gap-4 text-sm opacity-75">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            {habit.streak} day streak
                          </span>
                          <span className="capitalize">{habit.frequency}</span>
                          <span>{habit.completedDates.length} times completed</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-500">{habit.streak}</div>
                        <div className="text-xs opacity-75">streak</div>
                      </div>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Progress</span>
                      <span>{Math.min(habit.completedDates.filter(date => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(date) > weekAgo;
                      }).length, 7)}/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(habit.completedDates.filter(date => {
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return new Date(date) > weekAgo;
                          }).length * 100 / 7, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {habits.length === 0 && (
                <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="opacity-75">No habits yet. Add one above to start building consistency!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;