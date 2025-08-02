import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Target, TrendingUp, Heart, BookOpen, Sparkles, Sun, Moon, Download, Upload, Star, Smile, Brain, Award } from 'lucide-react';

interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedToday: boolean;
  completedDates: string[];
  lastCompleted?: string;
  createdAt: string;
  category: 'health' | 'mindfulness' | 'learning' | 'creativity';
}

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  priority: 'low' | 'medium' | 'high';
}

interface JournalEntry {
  id: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'challenging';
  date: string;
  gratitude: string[];
  affirmation: string;
}

interface Affirmation {
  id: string;
  text: string;
  category: 'confidence' | 'success' | 'health' | 'relationships' | 'abundance';
  createdAt: string;
  timesViewed: number;
}

const moodEmojis = {
  great: '😊',
  good: '🙂',
  okay: '😐',
  challenging: '😔'
};

const moodColors = {
  great: 'bg-green-100 text-green-800 border-green-200',
  good: 'bg-blue-100 text-blue-800 border-blue-200',
  okay: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  challenging: 'bg-purple-100 text-purple-800 border-purple-200'
};

const categoryIcons = {
  health: '💪',
  mindfulness: '🧘',
  learning: '📚',
  creativity: '🎨'
};

const affirmationCategories = {
  confidence: '💪',
  success: '🏆',
  health: '🌱',
  relationships: '❤️',
  abundance: '✨'
};

const positiveWords = [
  'Amazing', 'Brilliant', 'Creative', 'Determined', 'Empowered', 'Focused', 'Grateful', 'Happy',
  'Inspired', 'Joyful', 'Kind', 'Loving', 'Motivated', 'Optimistic', 'Peaceful', 'Radiant',
  'Strong', 'Thankful', 'Unique', 'Vibrant', 'Wise', 'Wonderful', 'Abundant', 'Blessed',
  'Confident', 'Deserving', 'Excellent', 'Fearless', 'Glorious', 'Harmonious', 'Incredible'
];

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [affirmations, setAffirmations] = useState<Affirmation[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'goals' | 'journal' | 'affirmations'>('dashboard');
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // Form states
  const [newHabit, setNewHabit] = useState('');
  const [habitCategory, setHabitCategory] = useState<Habit['category']>('health');
  const [newGoal, setNewGoal] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [goalType, setGoalType] = useState<'daily' | 'weekly'>('daily');
  const [newAffirmation, setNewAffirmation] = useState('');
  const [affirmationCategory, setAffirmationCategory] = useState<Affirmation['category']>('confidence');
  
  // Journal form states
  const [journalContent, setJournalContent] = useState('');
  const [journalMood, setJournalMood] = useState<JournalEntry['mood']>('good');
  const [gratitudeItems, setGratitudeItems] = useState<string[]>(['', '', '']);
  const [dailyAffirmation, setDailyAffirmation] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('growthHabits');
    const savedGoals = localStorage.getItem('growthGoals');
    const savedJournal = localStorage.getItem('growthJournal');
    const savedAffirmations = localStorage.getItem('growthAffirmations');
    const savedDarkMode = localStorage.getItem('growthDarkMode');
    
    if (savedHabits) setHabits(JSON.parse(savedHabits));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
    if (savedJournal) setJournalEntries(JSON.parse(savedJournal));
    if (savedAffirmations) setAffirmations(JSON.parse(savedAffirmations));
    if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));
    
    checkDailyReset();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('growthHabits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('growthGoals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('growthJournal', JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem('growthAffirmations', JSON.stringify(affirmations));
  }, [affirmations]);

  useEffect(() => {
    localStorage.setItem('growthDarkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('lastGrowthReset');
    
    if (lastReset !== today) {
      const savedHabits = localStorage.getItem('growthHabits');
      if (savedHabits) {
        const parsedHabits = JSON.parse(savedHabits);
        const resetHabits = parsedHabits.map((habit: Habit) => ({
          ...habit,
          completedToday: false
        }));
        setHabits(resetHabits);
      }
      
      const savedGoals = localStorage.getItem('growthGoals');
      if (savedGoals) {
        const parsedGoals = JSON.parse(savedGoals);
        const resetGoals = parsedGoals.map((goal: Goal) => ({
          ...goal,
          completed: goal.type === 'weekly' ? goal.completed : false
        }));
        setGoals(resetGoals);
      }
      
      localStorage.setItem('lastGrowthReset', today);
    }
  };

  const addHabit = () => {
    if (newHabit.trim()) {
      const habit: Habit = {
        id: Date.now().toString(),
        name: newHabit,
        frequency: 'daily',
        streak: 0,
        completedToday: false,
        completedDates: [],
        createdAt: new Date().toISOString(),
        category: habitCategory
      };
      setHabits([...habits, habit]);
      setNewHabit('');
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal,
        description: goalDescription,
        type: goalType,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: 'medium'
      };
      setGoals([...goals, goal]);
      setNewGoal('');
      setGoalDescription('');
    }
  };

  const addAffirmation = () => {
    if (newAffirmation.trim()) {
      const affirmation: Affirmation = {
        id: Date.now().toString(),
        text: newAffirmation,
        category: affirmationCategory,
        createdAt: new Date().toISOString(),
        timesViewed: 0
      };
      setAffirmations([...affirmations, affirmation]);
      setNewAffirmation('');
    }
  };

  const addJournalEntry = () => {
    if (journalContent.trim()) {
      const entry: JournalEntry = {
        id: Date.now().toString(),
        content: journalContent,
        mood: journalMood,
        date: new Date().toISOString(),
        gratitude: gratitudeItems.filter(item => item.trim()),
        affirmation: dailyAffirmation
      };
      setJournalEntries([entry, ...journalEntries]);
      setJournalContent('');
      setGratitudeItems(['', '', '']);
      setDailyAffirmation('');
    }
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

  const toggleGoal = (id: string) => {
    setGoals(goals.map(goal => 
      goal.id === id 
        ? { 
            ...goal, 
            completed: !goal.completed,
            completedAt: !goal.completed ? new Date().toISOString() : undefined
          }
        : goal
    ));
  };

  const getRandomAffirmation = () => {
    if (affirmations.length === 0) return "I am capable of achieving great things!";
    const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
    
    // Update view count
    setAffirmations(affirmations.map(aff => 
      aff.id === randomAffirmation.id 
        ? { ...aff, timesViewed: aff.timesViewed + 1 }
        : aff
    ));
    
    return randomAffirmation.text;
  };

  const exportData = () => {
    const data = { habits, goals, journalEntries, affirmations };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personal-growth-data.json';
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.habits) setHabits(data.habits);
          if (data.goals) setGoals(data.goals);
          if (data.journalEntries) setJournalEntries(data.journalEntries);
          if (data.affirmations) setAffirmations(data.affirmations);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const today = new Date().toISOString().split('T')[0];
    
    if (viewMode === 'daily') {
      return {
        habits: habits,
        goals: goals.filter(g => g.type === 'daily'),
        journalEntries: journalEntries.filter(e => e.date.split('T')[0] === today)
      };
    } else {
      return {
        habits: habits,
        goals: goals.filter(g => g.type === 'weekly'),
        journalEntries: journalEntries.filter(e => new Date(e.date) >= startOfWeek)
      };
    }
  };

  const filteredData = getFilteredData();
  const completedHabitsToday = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const completedGoalsToday = filteredData.goals.filter(g => g.completed).length;
  const totalGoals = filteredData.goals.length;
  const bestStreak = Math.max(...habits.map(h => h.streak), 0);
  const journalEntriesThisWeek = journalEntries.filter(e => {
    const entryDate = new Date(e.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate > weekAgo;
  }).length;

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-sm border-b transition-all duration-300 ${
        darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-500" />
              Personal Growth Board
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('daily')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'daily'
                      ? 'bg-purple-500 text-white'
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Daily
                </button>
                <button
                  onClick={() => setViewMode('weekly')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'weekly'
                      ? 'bg-purple-500 text-white'
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
              </div>
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
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Target },
              { id: 'habits', label: 'Habits', icon: TrendingUp },
              { id: 'goals', label: 'Goals', icon: Award },
              { id: 'journal', label: 'Journal', icon: BookOpen },
              { id: 'affirmations', label: 'Affirmations', icon: Heart }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-purple-500 text-white shadow-md'
                      : darkMode 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Habits</div>
                    <div className="text-xl font-bold text-purple-500">{completedHabitsToday}/{totalHabits}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Goals</div>
                    <div className="text-xl font-bold text-blue-500">{completedGoalsToday}/{totalGoals}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Star className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Best Streak</div>
                    <div className="text-xl font-bold text-orange-500">{bestStreak}</div>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm opacity-75">Journal Entries</div>
                    <div className="text-xl font-bold text-green-500">{journalEntriesThisWeek}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Affirmation */}
            <div className={`p-6 rounded-xl shadow-sm text-center ${darkMode ? 'bg-gradient-to-r from-purple-800 to-pink-800' : 'bg-gradient-to-r from-purple-100 to-pink-100'}`}>
              <h2 className="text-lg font-semibold mb-3 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Daily Affirmation
              </h2>
              <p className="text-xl font-medium italic mb-4">"{getRandomAffirmation()}"</p>
              <button
                onClick={() => setActiveTab('affirmations')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                View All Affirmations
              </button>
            </div>

            {/* Positive Word Cloud */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Positive Energy Cloud
              </h2>
              <div className="flex flex-wrap gap-2">
                {positiveWords.map((word, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all hover:scale-105 cursor-pointer ${
                      darkMode 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                        : 'bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800'
                    }`}
                    style={{
                      fontSize: `${Math.random() * 0.5 + 0.8}rem`,
                      opacity: Math.random() * 0.4 + 0.6
                    }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Overview */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Habits */}
              <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-lg font-semibold mb-4">Today's Habits</h3>
                <div className="space-y-3">
                  {habits.slice(0, 3).map(habit => (
                    <div key={habit.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          habit.completedToday
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-green-500'
                        }`}
                      >
                        {habit.completedToday && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1">
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-sm opacity-75">{habit.streak} day streak</div>
                      </div>
                      <span className="text-lg">{categoryIcons[habit.category]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Goals */}
              <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className="text-lg font-semibold mb-4">{viewMode === 'daily' ? 'Today\'s' : 'This Week\'s'} Goals</h3>
                <div className="space-y-3">
                  {filteredData.goals.slice(0, 3).map(goal => (
                    <div key={goal.id} className="flex items-center gap-3">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          goal.completed
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {goal.completed && <span className="text-xs">✓</span>}
                      </button>
                      <div className="flex-1">
                        <div className={`font-medium ${goal.completed ? 'line-through opacity-75' : ''}`}>
                          {goal.title}
                        </div>
                        <div className="text-sm opacity-75 capitalize">{goal.type} goal</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
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
                  className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <select
                  value={habitCategory}
                  onChange={(e) => setHabitCategory(e.target.value as Habit['category'])}
                  className={`px-4 py-2 rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="health">💪 Health</option>
                  <option value="mindfulness">🧘 Mindfulness</option>
                  <option value="learning">📚 Learning</option>
                  <option value="creativity">🎨 Creativity</option>
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

            {/* Habits List */}
            <div className="grid gap-4">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={`p-6 rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                          habit.completedToday
                            ? 'bg-purple-500 border-purple-500 text-white'
                            : 'border-gray-300 hover:border-purple-500'
                        }`}
                      >
                        {habit.completedToday ? <span className="text-lg">✓</span> : categoryIcons[habit.category]}
                      </button>
                      
                      <div>
                        <h3 className="text-lg font-semibold">{habit.name}</h3>
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
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-purple-500">{habit.streak}</div>
                      <div className="text-xs opacity-75">streak</div>
                    </div>
                  </div>
                  
                  {/* Progress Visualization */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Weekly Progress</span>
                      <span>{Math.min(habit.completedDates.filter(date => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return new Date(date) > weekAgo;
                      }).length, 7)}/7</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
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
                  <div className="text-4xl mb-4">🌱</div>
                  <p className="opacity-75">No habits yet. Start building positive routines!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            {/* Add Goal */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="What do you want to achieve?"
                    className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value as 'daily' | 'weekly')}
                    className={`px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <textarea
                  value={goalDescription}
                  onChange={(e) => setGoalDescription(e.target.value)}
                  placeholder="Describe your goal (optional)"
                  rows={2}
                  className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300'
                  }`}
                />
                <button
                  onClick={addGoal}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Goal
                </button>
              </div>
            </div>

            {/* Goals List */}
            <div className="grid gap-4">
              {filteredData.goals.map(goal => (
                <div
                  key={goal.id}
                  className={`p-6 rounded-xl shadow-sm transition-all duration-200 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } ${goal.completed ? 'ring-2 ring-green-300' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all mt-1 ${
                        goal.completed
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {goal.completed && <span className="text-sm">✓</span>}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${goal.completed ? 'line-through opacity-75' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-sm opacity-75 mt-1">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                          goal.type === 'daily' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {goal.type}
                        </span>
                        {goal.completedAt && (
                          <span className="text-xs opacity-75">
                            Completed {new Date(goal.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredData.goals.length === 0 && (
                <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="opacity-75">No {viewMode} goals yet. Set some targets to achieve!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'journal' && (
          <div className="space-y-6">
            {/* Add Journal Entry */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Daily Reflection</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
                  <div className="flex gap-2">
                    {Object.entries(moodEmojis).map(([mood, emoji]) => (
                      <button
                        key={mood}
                        onClick={() => setJournalMood(mood as JournalEntry['mood'])}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          journalMood === mood
                            ? 'border-purple-500 bg-purple-100'
                            : 'border-gray-300 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <div className="text-xs capitalize mt-1">{mood}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What's on your mind?</label>
                  <textarea
                    value={journalContent}
                    onChange={(e) => setJournalContent(e.target.value)}
                    placeholder="Write about your day, thoughts, or feelings..."
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Three things I'm grateful for:</label>
                  <div className="space-y-2">
                    {gratitudeItems.map((item, index) => (
                      <input
                        key={index}
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const newItems = [...gratitudeItems];
                          newItems[index] = e.target.value;
                          setGratitudeItems(newItems);
                        }}
                        placeholder={`Gratitude ${index + 1}...`}
                        className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Daily Affirmation:</label>
                  <input
                    type="text"
                    value={dailyAffirmation}
                    onChange={(e) => setDailyAffirmation(e.target.value)}
                    placeholder="I am..."
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <button
                  onClick={addJournalEntry}
                  className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Save Entry
                </button>
              </div>
            </div>

            {/* Journal Entries */}
            <div className="space-y-4">
              {journalEntries.map(entry => (
                <div
                  key={entry.id}
                  className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                      <div>
                        <div className="font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${moodColors[entry.mood]}`}>
                          {entry.mood}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Reflection:</h4>
                      <p className="text-sm opacity-90">{entry.content}</p>
                    </div>

                    {entry.gratitude.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          Gratitude:
                        </h4>
                        <ul className="text-sm opacity-90 space-y-1">
                          {entry.gratitude.map((item, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="text-yellow-500">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entry.affirmation && (
                      <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          Affirmation:
                        </h4>
                        <p className="text-sm italic opacity-90">"{entry.affirmation}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {journalEntries.length === 0 && (
                <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-4xl mb-4">📖</div>
                  <p className="opacity-75">No journal entries yet. Start reflecting on your journey!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'affirmations' && (
          <div className="space-y-6">
            {/* Add Affirmation */}
            <div className={`p-6 rounded-xl shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-lg font-semibold mb-4">Add New Affirmation</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newAffirmation}
                    onChange={(e) => setNewAffirmation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAffirmation()}
                    placeholder="I am capable of achieving great things..."
                    className={`flex-1 px-4 py-2 rounded-lg border focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                  <select
                    value={affirmationCategory}
                    onChange={(e) => setAffirmationCategory(e.target.value as Affirmation['category'])}
                    className={`px-4 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="confidence">💪 Confidence</option>
                    <option value="success">🏆 Success</option>
                    <option value="health">🌱 Health</option>
                    <option value="relationships">❤️ Relationships</option>
                    <option value="abundance">✨ Abundance</option>
                  </select>
                  <button
                    onClick={addAffirmation}
                    className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Affirmations List */}
            <div className="grid gap-4">
              {affirmations.map(affirmation => (
                <div
                  key={affirmation.id}
                  className={`p-6 rounded-xl shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer ${
                    darkMode ? 'bg-gradient-to-r from-pink-800 to-purple-800' : 'bg-gradient-to-r from-pink-100 to-purple-100'
                  }`}
                  onClick={() => {
                    setAffirmations(affirmations.map(aff => 
                      aff.id === affirmation.id 
                        ? { ...aff, timesViewed: aff.timesViewed + 1 }
                        : aff
                    ));
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{affirmationCategories[affirmation.category]}</span>
                    <div className="flex-1">
                      <p className="text-lg font-medium italic">"{affirmation.text}"</p>
                      <div className="flex items-center gap-4 mt-2 text-sm opacity-75">
                        <span className="capitalize">{affirmation.category}</span>
                        <span>Viewed {affirmation.timesViewed} times</span>
                        <span>{new Date(affirmation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {affirmations.length === 0 && (
                <div className={`p-8 text-center rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="text-4xl mb-4">✨</div>
                  <p className="opacity-75">No affirmations yet. Create positive statements to empower yourself!</p>
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