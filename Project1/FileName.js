import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause, RotateCcw, CheckCircle, Circle, Calendar, Music, Sun, Moon, Star, Heart, Sparkles } from 'lucide-react';

export default function ProductivityApp() {
    const [darkMode, setDarkMode] = useState(false);
    const [activeTab, setActiveTab] = useState('todo');
    const [colorTheme, setColorTheme] = useState('pink');

    // Todo State
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [taskCategory, setTaskCategory] = useState('Study');
    const [taskDeadline, setTaskDeadline] = useState('');

    // Timer State
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [focusDuration, setFocusDuration] = useState(25);
    const [focusUnit, setFocusUnit] = useState('minutes');
    const [breakDuration, setBreakDuration] = useState(5);
    const [sessionsCompleted, setSessionsCompleted] = useState(0);

    // Load from memory
    useEffect(() = > {
        const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        setTasks(savedTasks);
    }, []);

    useEffect(() = > {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    // Timer Logic
    useEffect(() = > {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() = > {
                if (seconds > 0) {
                    setSeconds(seconds - 1);
                }
                else if (timerMinutes > 0) {
                    setTimerMinutes(timerMinutes - 1);
                    setSeconds(59);
                }
                else {
                    setIsRunning(false);
                    if (!isBreak) {
                        setSessionsCompleted(sessionsCompleted + 1);
                        setIsBreak(true);
                        setTimerMinutes(breakDuration);
                    }
                    else {
                        setIsBreak(false);
                        const minutes = focusUnit == = 'hours' ? focusDuration * 60 : focusDuration;
                        setTimerMinutes(minutes);
                    }
                    setSeconds(0);
                }
            }, 1000);
        }
        return () = > clearInterval(interval);
    }, [isRunning, seconds, timerMinutes, isBreak, focusDuration, breakDuration, sessionsCompleted]);

    const addTask = () = > {
        if (newTask.trim()) {
            const task = {
              id: Date.now(),
              text : newTask,
              category : taskCategory,
              deadline : taskDeadline,
              completed : false,
              createdAt : new Date().toISOString()
            };
            setTasks([...tasks, task]);
            setNewTask('');
            setTaskDeadline('');
        }
    };

    const toggleTask = (id) = > {
        setTasks(tasks.map(task = >
            task.id == = id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteTask = (id) = > {
        setTasks(tasks.filter(task = > task.id != = id));
    };

    const startTimer = () = > setIsRunning(true);
    const pauseTimer = () = > setIsRunning(false);
    const resetTimer = () = > {
        setIsRunning(false);
        const minutes = isBreak ? breakDuration : (focusUnit == = 'hours' ? focusDuration * 60 : focusDuration);
        setTimerMinutes(minutes);
        setSeconds(0);
    };

    // Get today's date at midnight
    const getTodayDate = () = > {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    const getTomorrowDate = () = > {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return tomorrow;
    };

    const getDayAfterTomorrowDate = () = > {
        const dayAfter = new Date();
        dayAfter.setDate(dayAfter.getDate() + 2);
        dayAfter.setHours(0, 0, 0, 0);
        return dayAfter;
    };

    // Categorize tasks by date
    const categorizeTasks = () = > {
        const today = getTodayDate();
        const tomorrow = getTomorrowDate();
        const dayAfterTomorrow = getDayAfterTomorrowDate();

        const categorized = {
          today: [] ,
          tomorrow : [] ,
          later : {}
        };

        tasks.forEach(task = > {
            if (!task.deadline) {
                categorized.today.push(task);
                return;
            }

            const taskDate = new Date(task.deadline);
            taskDate.setHours(0, 0, 0, 0);

            if (taskDate.getTime() == = today.getTime()) {
                categorized.today.push(task);
            }
            else if (taskDate.getTime() == = tomorrow.getTime()) {
                categorized.tomorrow.push(task);
            }
            else if (taskDate >= dayAfterTomorrow) {
                const dateKey = taskDate.toLocaleDateString('en-US', { weekday: 'long', month : 'short', day : 'numeric' });
                if (!categorized.later[dateKey]) {
                    categorized.later[dateKey] = [];
                }
                categorized.later[dateKey].push(task);
            }
            else {
                // Past dates go to today
                categorized.today.push(task);
            }
        });

        return categorized;
    };

    const categorizedTasks = categorizeTasks();

    // Progress only for today's tasks
    const todayCompletedTasks = categorizedTasks.today.filter(t = > t.completed).length;
    const todayTotalTasks = categorizedTasks.today.length;
    const progressPercent = todayTotalTasks > 0 ? Math.round((todayCompletedTasks / todayTotalTasks) * 100) : 0;

    const getCategoryStyle = (category) = > {
        const styles = {
          'Study': darkMode ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' : 'bg-purple-100 text-purple-600 border-purple-300',
          'Break' : darkMode ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-green-100 text-green-600 border-green-300',
          'Personal' : darkMode ? 'bg-pink-500/20 text-pink-300 border-pink-400/30' : 'bg-pink-100 text-pink-600 border-pink-300',
          'Work' : darkMode ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' : 'bg-orange-100 text-orange-600 border-orange-300'
        };
        return styles[category] || (darkMode ? 'bg-gray-500/20 text-gray-300 border-gray-400/30' : 'bg-gray-100 text-gray-600 border-gray-300');
    };

    const getCategoryEmoji = (category) = > {
        const emojis = { 'Study': '??', 'Break' : '?', 'Personal' : '??', 'Work' : '??' };
        return emojis[category] || '?';
    };

    const timerProgress = ((isBreak ? breakDuration : (focusUnit == = 'hours' ? focusDuration * 60 : focusDuration)) * 60 - (timerMinutes * 60 + seconds)) / ((isBreak ? breakDuration : (focusUnit == = 'hours' ? focusDuration * 60 : focusDuration)) * 60) * 100;

    const colorThemes = {
      pink: {
        light: {
          bg: 'from-pink-100 via-purple-100 to-blue-100',
          gradient : 'from-pink-400 to-purple-400',
          buttonGradient : 'from-pink-500 to-purple-500',
          hoverGradient : 'from-pink-600 to-purple-600',
          text : 'from-pink-500 via-purple-500 to-blue-500',
          border : 'border-pink-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-pink-400 via-purple-400 to-blue-400'
        },
        dark: {
          bg: 'from-indigo-950 via-purple-950 to-pink-950',
          gradient : 'from-pink-500 to-purple-500',
          buttonGradient : 'from-pink-500 to-purple-500',
          hoverGradient : 'from-pink-600 to-purple-600',
          text : 'from-pink-300 via-purple-300 to-blue-300',
          border : 'border-purple-500/30',
          cardBg : 'from-purple-900/50 to-pink-900/50',
          progressBar : 'from-pink-400 via-purple-400 to-blue-400'
        }
      },
      red: {
        light: {
          bg: 'from-red-100 via-orange-100 to-yellow-100',
          gradient : 'from-red-400 to-orange-400',
          buttonGradient : 'from-red-500 to-orange-500',
          hoverGradient : 'from-red-600 to-orange-600',
          text : 'from-red-500 via-orange-500 to-yellow-500',
          border : 'border-red-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-red-400 via-orange-400 to-yellow-400'
        },
        dark: {
          bg: 'from-red-950 via-orange-950 to-yellow-950',
          gradient : 'from-red-500 to-orange-500',
          buttonGradient : 'from-red-500 to-orange-500',
          hoverGradient : 'from-red-600 to-orange-600',
          text : 'from-red-300 via-orange-300 to-yellow-300',
          border : 'border-red-500/30',
          cardBg : 'from-red-900/50 to-orange-900/50',
          progressBar : 'from-red-400 via-orange-400 to-yellow-400'
        }
      },
      orange: {
        light: {
          bg: 'from-orange-100 via-amber-100 to-yellow-100',
          gradient : 'from-orange-400 to-amber-400',
          buttonGradient : 'from-orange-500 to-amber-500',
          hoverGradient : 'from-orange-600 to-amber-600',
          text : 'from-orange-500 via-amber-500 to-yellow-500',
          border : 'border-orange-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-orange-400 via-amber-400 to-yellow-400'
        },
        dark: {
          bg: 'from-orange-950 via-amber-950 to-yellow-950',
          gradient : 'from-orange-500 to-amber-500',
          buttonGradient : 'from-orange-500 to-amber-500',
          hoverGradient : 'from-orange-600 to-amber-600',
          text : 'from-orange-300 via-amber-300 to-yellow-300',
          border : 'border-orange-500/30',
          cardBg : 'from-orange-900/50 to-amber-900/50',
          progressBar : 'from-orange-400 via-amber-400 to-yellow-400'
        }
      },
      yellow: {
        light: {
          bg: 'from-yellow-100 via-lime-100 to-green-100',
          gradient : 'from-yellow-400 to-lime-400',
          buttonGradient : 'from-yellow-500 to-lime-500',
          hoverGradient : 'from-yellow-600 to-lime-600',
          text : 'from-yellow-500 via-lime-500 to-green-500',
          border : 'border-yellow-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-yellow-400 via-lime-400 to-green-400'
        },
        dark: {
          bg: 'from-yellow-950 via-lime-950 to-green-950',
          gradient : 'from-yellow-500 to-lime-500',
          buttonGradient : 'from-yellow-500 to-lime-500',
          hoverGradient : 'from-yellow-600 to-lime-600',
          text : 'from-yellow-300 via-lime-300 to-green-300',
          border : 'border-yellow-500/30',
          cardBg : 'from-yellow-900/50 to-lime-900/50',
          progressBar : 'from-yellow-400 via-lime-400 to-green-400'
        }
      },
      green: {
        light: {
          bg: 'from-green-100 via-emerald-100 to-teal-100',
          gradient : 'from-green-400 to-emerald-400',
          buttonGradient : 'from-green-500 to-emerald-500',
          hoverGradient : 'from-green-600 to-emerald-600',
          text : 'from-green-500 via-emerald-500 to-teal-500',
          border : 'border-green-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-green-400 via-emerald-400 to-teal-400'
        },
        dark: {
          bg: 'from-green-950 via-emerald-950 to-teal-950',
          gradient : 'from-green-500 to-emerald-500',
          buttonGradient : 'from-green-500 to-emerald-500',
          hoverGradient : 'from-green-600 to-emerald-600',
          text : 'from-green-300 via-emerald-300 to-teal-300',
          border : 'border-green-500/30',
          cardBg : 'from-green-900/50 to-emerald-900/50',
          progressBar : 'from-green-400 via-emerald-400 to-teal-400'
        }
      },
      blue: {
        light: {
          bg: 'from-blue-100 via-cyan-100 to-sky-100',
          gradient : 'from-blue-400 to-cyan-400',
          buttonGradient : 'from-blue-500 to-cyan-500',
          hoverGradient : 'from-blue-600 to-cyan-600',
          text : 'from-blue-500 via-cyan-500 to-sky-500',
          border : 'border-blue-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-blue-400 via-cyan-400 to-sky-400'
        },
        dark: {
          bg: 'from-blue-950 via-cyan-950 to-sky-950',
          gradient : 'from-blue-500 to-cyan-500',
          buttonGradient : 'from-blue-500 to-cyan-500',
          hoverGradient : 'from-blue-600 to-cyan-600',
          text : 'from-blue-300 via-cyan-300 to-sky-300',
          border : 'border-blue-500/30',
          cardBg : 'from-blue-900/50 to-cyan-900/50',
          progressBar : 'from-blue-400 via-cyan-400 to-sky-400'
        }
      },
      purple: {
        light: {
          bg: 'from-purple-100 via-violet-100 to-indigo-100',
          gradient : 'from-purple-400 to-violet-400',
          buttonGradient : 'from-purple-500 to-violet-500',
          hoverGradient : 'from-purple-600 to-violet-600',
          text : 'from-purple-500 via-violet-500 to-indigo-500',
          border : 'border-purple-200',
          cardBg : 'bg-white/80',
          progressBar : 'from-purple-400 via-violet-400 to-indigo-400'
        },
        dark: {
          bg: 'from-purple-950 via-violet-950 to-indigo-950',
          gradient : 'from-purple-500 to-violet-500',
          buttonGradient : 'from-purple-500 to-violet-500',
          hoverGradient : 'from-purple-600 to-violet-600',
          text : 'from-purple-300 via-violet-300 to-indigo-300',
          border : 'border-purple-500/30',
          cardBg : 'from-purple-900/50 to-violet-900/50',
          progressBar : 'from-purple-400 via-violet-400 to-indigo-400'
        }
      }
    };

    const theme = colorThemes[colorTheme][darkMode ? 'dark' : 'light'];

    return (
        < div className = { `min-h - screen transition - all duration - 500 bg - gradient - to - br ${theme.bg}`} >

          {/* Floating decorative elements */}
          <div className = "fixed inset-0 overflow-hidden pointer-events-none">
            < Star className = {`absolute top - 20 left - 10 ${darkMode ? 'text-yellow-300' : 'text-yellow-400'} opacity - 40 animate - pulse`} size = {24} / >
            < Heart className = {`absolute top - 40 right - 20 ${darkMode ? 'text-pink-400' : 'text-pink-300'} opacity - 40 animate - pulse`} size = {28} style = {{animationDelay: '0.5s'}} / >
            < Sparkles className = {`absolute bottom - 40 left - 1 / 4 ${darkMode ? 'text-purple-400' : 'text-purple-300'} opacity - 40 animate - pulse`} size = {26} style = {{animationDelay: '1s'}} / >
            < Star className = {`absolute bottom - 20 right - 1 / 3 ${darkMode ? 'text-blue-400' : 'text-blue-300'} opacity - 40 animate - pulse`} size = {22} style = {{animationDelay: '1.5s'}} / >
          < / div>

          <div className = "max-w-5xl mx-auto p-6 relative">

            {/* Header */}
            < div className = {`${
              darkMode
                ? `bg-gradient - to - r ${theme.cardBg} backdrop - blur - xl border ${theme.border}`
                : `${theme.cardBg} backdrop - blur - xl border - 2 ${theme.border}`
            } rounded - 3xl shadow - 2xl p - 8 mb - 6 transition - all duration - 300`} >
              <div className = "flex justify-between items-center mb-6">
                <div>
                  < h1 className = {`text-4xl font - bold mb - 2 bg - gradient - to - r ${theme.text} bg - clip - text text - transparent`} >
                    ? Cutie Productivity Hub ?
                  < / h1>
                  < p className = {`flex items - center gap - 2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
                    < Heart size = {16} className = "fill-current" / >
                    Stay focused and adorable!
                    < Heart size = {16} className = "fill-current" / >
                  < / p>
                < / div>
                <div className = "flex gap-3">
                  {/* Color Theme Selector */}
                  <div className = "flex gap-2 items-center">
                    { ['pink', 'red', 'orange', 'yellow', 'green', 'blue', 'purple'] .map((color) = > (
                      < button
                        key = {color}
                        onClick = {() = > setColorTheme(color)}
                        className = {`w-8 h - 8 rounded - full transition - all duration - 300 transform hover : scale - 110 ${
                          colorTheme == = color ? 'ring-4 ring-white shadow-lg' : ''
                        }`}
                        style = {{
                          background: color == = 'pink' ? 'linear-gradient(135deg, #ec4899, #a855f7)' :
                                     color == = 'red' ? 'linear-gradient(135deg, #ef4444, #f97316)' :
                                     color == = 'orange' ? 'linear-gradient(135deg, #f97316, #f59e0b)' :
                                     color == = 'yellow' ? 'linear-gradient(135deg, #eab308, #84cc16)' :
                                     color == = 'green' ? 'linear-gradient(135deg, #22c55e, #10b981)' :
                                     color == = 'blue' ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' :
                                     'linear-gradient(135deg, #a855f7, #6366f1)'
                        }}
                        title = {color.charAt(0).toUpperCase() + color.slice(1)}
                      / >
                    ))}
                  < / div>
                  < button
                    onClick = {() = > setDarkMode(!darkMode)}
                    className = {`p-4 rounded - full transition - all duration - 300 transform hover : scale - 110 ${
                      darkMode
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400 shadow-lg shadow-yellow-500/50'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/50'
                    }`}
                  >
                    {darkMode ? < Sun className = "text-white" size = {24} / > : < Moon className = "text-white" size = {24} / > }
                  < / button>
                < / div>
              < / div>

              {/* Cute Tabs */}
              <div className = "flex gap-3">
                < button
                  onClick = {() = > setActiveTab('todo')}
                  className = {`flex-1 px - 6 py - 4 rounded - 2xl font - bold transition - all duration - 300 transform hover : scale - 105 ${
                    activeTab == = 'todo'
                      ? `bg-gradient - to - r ${theme.buttonGradient} text - white shadow - lg`
                      : darkMode
                        ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                        : 'bg-white/60 text-purple-600 hover:bg-white/80'
                  }`}
                >
                  ?? To - Do List
                < / button>
                < button
                  onClick = {() = > setActiveTab('timer')}
                  className = {`flex-1 px - 6 py - 4 rounded - 2xl font - bold transition - all duration - 300 transform hover : scale - 105 ${
                    activeTab == = 'timer'
                      ? `bg-gradient - to - r ${theme.gradient} text - white shadow - lg`
                      : darkMode
                        ? 'bg-purple-900/30 text-purple-300 hover:bg-purple-900/50'
                        : 'bg-white/60 text-purple-600 hover:bg-white/80'
                  }`}
                >
                  ? Study Timer
                < / button>
              < / div>
            < / div>

            {/* Todo Tab */}
            {
    activeTab == = 'todo' && (
     <div className = "space-y-6">
       {/* Progress Card */}
       < div className = {`${
         darkMode
           ? `bg-gradient - to - br ${theme.cardBg} backdrop - blur - xl border ${theme.border}`
           : `${theme.cardBg} backdrop - blur - xl border - 2 ${theme.border}`
       } rounded - 3xl shadow - xl p - 6 transition - all duration - 300`} >
         <div className = "flex justify-between items-center mb-3">
           < h3 className = {`text-xl font - bold flex items - center gap - 2 ${darkMode ? 'text-pink-300' : 'text-pink-600'}`} >
             < Sparkles size = {20} className = "animate-pulse" / >
             Today's Progress
           < / h3 >
           < span className = {`text-3xl font - bold bg - gradient - to - r ${theme.text} bg - clip - text text - transparent`} >
             {progressPercent} %
           < / span>
         < / div>
         < div className = {`w-full h - 6 rounded - full overflow - hidden ${
           darkMode ? 'bg-purple-950/50' : 'bg-pink-100'
         }`} >
           < div
             className = {`h-full bg - gradient - to - r ${theme.progressBar} rounded - full transition - all duration - 500 relative overflow - hidden`}
             style = {{ width: `${progressPercent} % ` }}
           >
             <div className = "absolute inset-0 bg-white/30 animate-pulse">< / div>
           < / div>
         < / div>
         < p className = {`text-sm mt - 2 flex items - center gap - 1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
           < Star size = {14} className = "fill-current" / >
           {todayCompletedTasks} of {todayTotalTasks} tasks completed today!
         < / p>
       < / div>

       {/* Add Task Card */}
       < div className = {`${
         darkMode
           ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30'
           : 'bg-white/80 backdrop-blur-xl border-2 border-purple-200'
       } rounded - 3xl shadow - xl p - 6 transition - all duration - 300`} >
         < h3 className = {`text-xl font - bold mb - 4 flex items - center gap - 2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
           < Plus size = {20} / >
           Add Cute Task
         < / h3>
         <div className = "space-y-3">
           < input
             type = "text"
             value = {newTask}
             onChange = {(e) = > setNewTask(e.target.value)}
             onKeyPress = {(e) = > e.key == = 'Enter' && addTask()}
             placeholder = "What magical thing will you do? ?"
             className = {`w-full px - 5 py - 4 rounded - 2xl border - 2 transition - all duration - 300 ${
               darkMode
                 ? 'bg-purple-950/30 border-purple-500/30 text-white placeholder-purple-400 focus:border-pink-500'
                 : 'bg-white border-purple-200 text-gray-800 placeholder-purple-400 focus:border-pink-400'
             } focus:ring - 4 focus : ring - pink - 500 / 20`}
           / >
           <div className = "flex gap-3">
             < select
               value = {taskCategory}
               onChange = {(e) = > setTaskCategory(e.target.value)}
               className = {`flex-1 px - 5 py - 4 rounded - 2xl border - 2 transition - all duration - 300 font - medium ${
                 darkMode
                   ? 'bg-purple-950/30 border-purple-500/30 text-white focus:border-pink-500'
                   : 'bg-white border-purple-200 text-gray-800 focus:border-pink-400'
               } focus:ring - 4 focus : ring - pink - 500 / 20`}
             >
               <option>Study< / option>
               <option>Break< / option>
               <option>Personal< / option>
               <option>Work< / option>
             < / select>
             < input
               type = "date"
               value = {taskDeadline}
               onChange = {(e) = > setTaskDeadline(e.target.value)}
               className = {`flex-1 px - 5 py - 4 rounded - 2xl border - 2 transition - all duration - 300 ${
                 darkMode
                   ? 'bg-purple-950/30 border-purple-500/30 text-white focus:border-pink-500'
                   : 'bg-white border-purple-200 text-gray-800 focus:border-pink-400'
               } focus:ring - 4 focus : ring - pink - 500 / 20`}
             / >
             < button
               onClick = {addTask}
               className = {`px-8 py - 4 bg - gradient - to - r ${theme.buttonGradient} hover:${theme.hoverGradient} text - white rounded - 2xl font - bold flex items - center gap - 2 transition - all duration - 300 transform hover : scale - 105 shadow - lg`}
             >
               < Plus size = {20} / >
               Add
             < / button>
           < / div>
         < / div>
       < / div>

       {/* Tasks List */}
       < div className = {`${
         darkMode
           ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 backdrop-blur-xl border border-pink-500/30'
           : 'bg-white/80 backdrop-blur-xl border-2 border-pink-200'
       } rounded - 3xl shadow - xl p - 6 transition - all duration - 300`} >
         < h3 className = {`text-xl font - bold mb - 4 flex items - center gap - 2 ${darkMode ? 'text-pink-300' : 'text-pink-600'}`} >
           < Heart size = {20} className = "fill-current" / >
           Your Cute Tasks
         < / h3>
         <div className = "space-y-3">
           {tasks.length == = 0 ? (
             <div className = "text-center py-12">
               < Sparkles className = {`mx-auto mb - 3 ${darkMode ? 'text-purple-400' : 'text-purple-400'} animate - pulse`} size = {48} / >
               < p className = {darkMode ? 'text-purple-300' : 'text-purple-600'} >
                 No tasks yet!Add your first adorable task above!??
               < / p>
             < / div>
           ) : (
             tasks.map(task = > (
               < div
                 key = {task.id}
                 className = {`flex items - center gap - 3 p - 4 rounded - 2xl transition - all duration - 300 transform hover : scale - 102 ${
                   darkMode
                     ? 'bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/20'
                     : 'bg-white/60 hover:bg-white/90 border border-purple-100'
                 }`}
               >
                 < button onClick = {() = > toggleTask(task.id)} className = "transition-transform duration-300 hover:scale-110" >
                   {task.completed ? (
                     < CheckCircle className = "text-green-500 fill-current" size = {28} / >
                   ) : (
                     < Circle className = {darkMode ? 'text-purple-400' : 'text-purple-400'} size = {28} / >
                   )}
                 < / button>
                 <div className = "flex-1">
                   < p className = {`font-semibold text - lg ${
                     task.completed
                       ? darkMode ? 'line-through text-purple-500' : 'line-through text-purple-400'
                       : darkMode ? 'text-white' : 'text-gray-800'
                   }`} >
                     {task.text}
                   < / p>
                   {task.deadline && (
                     < p className = {`text-sm flex items - center gap - 1 mt - 1 ${darkMode ? 'text-purple-300' : 'text-purple-500'}`} >
                       < Calendar size = {14} / >
                       {new Date(task.deadline).toLocaleDateString()}
                     < / p>
                   )}
                 < / div>
                 < span className = {`px-4 py - 2 rounded - full text - sm font - bold border - 2 flex items - center gap - 1 ${getCategoryStyle(task.category)}`} >
                   {getCategoryEmoji(task.category)} { task.category }
                 < / span>
                 < button
                   onClick = {() = > deleteTask(task.id)}
                   className = "p-2 hover:bg-red-100 rounded-xl transition-all duration-300 transform hover:scale-110"
                 >
                   < Trash2 className = "text-red-500" size = {20} / >
                 < / button>
               < / div>
             ))
           )}
         < / div>
       < / div>
     < / div>
   )}

   {/* Timer Tab */ }
   {
activeTab == = 'timer' && (
 <div className = "space-y-6">
   {/* Timer Display */}
   < div className = {`${
     darkMode
       ? 'bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-500/30'
       : 'bg-white/80 backdrop-blur-xl border-2 border-purple-200'
   } rounded - 3xl shadow - xl p - 10 transition - all duration - 300`} >
     <div className = "text-center">
       < h3 className = {`text-3xl font - bold mb - 8 flex items - center justify - center gap - 3 ${
         darkMode ? 'text-purple-300' : 'text-purple-600'
       }`} >
         {isBreak ? (
           <>? Cute Break Time!??< / >
         ) : (
           <>?? Focus Magic Time!?< / >
         )}
       < / h3>

       {/* Circular Progress */}
       <div className = "relative w-72 h-72 mx-auto mb-8">
         <svg className = "transform -rotate-90 w-72 h-72">
           < circle
             cx = "144"
             cy = "144"
             r = "130"
             stroke = {darkMode ? '#1e1b4b' : '#f3e8ff'}
             strokeWidth = "20"
             fill = "none"
           / >
           < circle
             cx = "144"
             cy = "144"
             r = "130"
             stroke = {isBreak
               ? 'url(#gradient-green)'
               : 'url(#gradient-purple)'
             }
             strokeWidth = "20"
             fill = "none"
             strokeDasharray = {817}
             strokeDashoffset = {817 - (817 * timerProgress) / 100}
             strokeLinecap = "round"
             className = "transition-all duration-1000"
           / >
           <defs>
             <linearGradient id = "gradient-purple" x1 = "0%" y1 = "0%" x2 = "100%" y2 = "100%">
               <stop offset = "0%" stopColor = "#ec4899" / >
               <stop offset = "50%" stopColor = "#a855f7" / >
               <stop offset = "100%" stopColor = "#3b82f6" / >
             < / linearGradient>
             <linearGradient id = "gradient-green" x1 = "0%" y1 = "0%" x2 = "100%" y2 = "100%">
               <stop offset = "0%" stopColor = "#10b981" / >
               <stop offset = "100%" stopColor = "#34d399" / >
             < / linearGradient>
           < / defs>
         < / svg>
         <div className = "absolute inset-0 flex items-center justify-center">
           <div className = "text-center">
             < div className = {`text-7xl font - bold mb - 2 bg - gradient - to - r ${theme.text} bg - clip - text text - transparent`} >
               {String(timerMinutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
             < / div>
             <div className = "flex items-center justify-center gap-2">
               < Star size = {16} className = {`fill-current ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} / >
               < p className = {`text-sm font - medium ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
                 {sessionsCompleted} sessions completed!
               < / p>
               < Star size = {16} className = {`fill-current ${darkMode ? 'text-yellow-400' : 'text-yellow-500'}`} / >
             < / div>
           < / div>
         < / div>
       < / div>

       {/* Timer Controls */}
       <div className = "flex justify-center gap-4">
         {!isRunning ? (
           < button
             onClick = {startTimer}
             className = "px-10 py-5 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-green-500/50"
           >
             < Play size = {24} / >
             Start
           < / button>
         ) : (
           < button
             onClick = {pauseTimer}
             className = "px-10 py-5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-2xl font-bold text-lg flex items-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-xl shadow-yellow-500/50"
           >
             < Pause size = {24} / >
             Pause
           < / button>
         )}
         < button
           onClick = {resetTimer}
           className = {`px-10 py - 5 rounded - 2xl font - bold text - lg flex items - center gap - 3 transition - all duration - 300 transform hover : scale - 105 shadow - xl ${
             darkMode
               ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 text-white shadow-purple-500/50'
               : 'bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 text-purple-800 shadow-purple-300/50'
           }`}
         >
           < RotateCcw size = {24} / >
           Reset
         < / button>
       < / div>
     < / div>
   < / div>

   {/* Timer Settings */}
   < div className = {`${
     darkMode
       ? 'bg-gradient-to-br from-pink-900/40 to-purple-900/40 backdrop-blur-xl border border-pink-500/30'
       : 'bg-white/80 backdrop-blur-xl border-2 border-pink-200'
   } rounded - 3xl shadow - xl p - 6 transition - all duration - 300`} >
     < h3 className = {`text-xl font - bold mb - 4 flex items - center gap - 2 ${darkMode ? 'text-pink-300' : 'text-pink-600'}`} >
       < Sparkles size = {20} / >
       Timer Settings
     < / h3>
     <div className = "grid grid-cols-1 gap-4">
       <div>
         < label className = {`block text - sm font - bold mb - 2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} >
           ?? Focus Duration
         < / label>
         <div className = "flex gap-3">
           < input
             type = "number"
             value = {focusDuration}
             onChange = {(e) = > {
               const val = parseInt(e.target.value) || 1;
               setFocusDuration(val);
               if (!isBreak && !isRunning) {
                 const minutes = focusUnit == = 'hours' ? val * 60 : val;
                 setTimerMinutes(minutes);
               }
             }}
             className = {`flex-1 px - 4 py - 3 rounded - 2xl border - 2 font - semibold transition - all duration - 300 ${
               darkMode
                 ? 'bg-purple-950/30 border-purple-500/30 text-white focus:border-pink-500'
                 : 'bg-white border-purple-200 text-gray-800 focus:border-pink-400'
             } focus:ring - 4 focus : ring - pink - 500 / 20`}
             min = "1"
           / >
           < select
             value = {focusUnit}
             onChange = {(e) = > {
               setFocusUnit(e.target.value);
               if (!isBreak && !isRunning) {
                 const minutes = e.target.value == = 'hours' ? focusDuration * 60 : focusDuration;
                 setTimerMinutes(minutes);
               }
             }}
             className = {`px-4 py - 3 rounded - 2xl border - 2 font - semibold transition - all duration - 300 ${
               darkMode
                 ? 'bg-purple-950/30 border-purple-500/30 text-white focus:border-pink-500'
                 : 'bg-white border-purple-200 text-gray-800 focus:border-pink-400'
             } focus:ring - 4 focus : ring - pink - 500 / 20`}
           >
             <option value = "minutes">Minutes< / option>
             <option value = "hours">Hours< / option>
           < / select>
         < / div>
       < / div>
       <div>
         < label className = {`block text - sm font - bold mb - 2 ${darkMode ? 'text-purple-300' : 'text-purple-700'}`} >
           ? Break Duration(minutes)
         < / label >
         < input
           type = "number"
           value = {breakDuration}
           onChange = {(e) = > {
             const val = parseInt(e.target.value) || 1;
             setBreakDuration(val);
             if (isBreak && !isRunning) setTimerMinutes(val);
           }}
           className = {`w-full px - 4 py - 3 rounded - 2xl border - 2 font - semibold transition - all duration - 300 ${
             darkMode
               ? 'bg-purple-950/30 border-purple-500/30 text-white focus:border-pink-500'
               : 'bg-white border-purple-200 text-gray-800 focus:border-pink-400'
           } focus:ring - 4 focus : ring - pink - 500 / 20`}
           min = "1"
         / >
       < / div>
     < / div>
   < / div>

   {/* Background Music */}
   < div className = {`${
     darkMode
       ? 'bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30'
       : 'bg-white/80 backdrop-blur-xl border-2 border-purple-200'
   } rounded - 3xl shadow - xl p - 6 transition - all duration - 300`} >
     < h3 className = {`text-xl font - bold mb - 4 flex items - center gap - 2 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
       < Music size = {20} / >
       Background Music ??
     < / h3>
     < p className = {`text-sm mb - 3 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`} >
       Add your favorite Spotify playlist to vibe while studying!?
     < / p>
     < input
       type = "text"
       placeholder = "Paste your Spotify playlist URL here... ??"
       className = {`w-full px - 5 py - 4 rounded - 2xl border - 2 transition - all duration - 300 ${
         darkMode
           ? 'bg-purple-950/30 border-purple-500/30 text-white placeholder-purple-400 focus:border-pink-500'
           : 'bg-white border-purple-200 text-gray-800 placeholder-purple-400 focus:border-pink-400'
       } focus:ring - 4 focus : ring - pink - 500 / 20`}
     / >
     < p className = {`text-xs mt - 2 ${darkMode ? 'text-purple-400' : 'text-purple-500'}`} >
       ?? Note : Spotify integration requires Premium & Web Playback SDK
     < / p>
   < / div>
 < / div>
)}
< / div>
< / div>
);
}