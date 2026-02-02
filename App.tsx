
import React, { useState, useCallback, useEffect } from 'react';
import { Task, Status } from './types';
import { INITIAL_TASKS, INITIAL_HISTORIAL } from './constants';
import { SummaryCards } from './components/SummaryCards';
import { ChartsGrid } from './components/ChartsGrid';
import { TaskTable } from './components/TaskTable';
import { TaskModal } from './components/TaskModal';
import { HistoryTable } from './components/HistoryTable';

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const STORAGE_KEYS = {
  TASKS: 'opdash_tasks_v3',
  HISTORY: 'opdash_history_v3',
  THEME: 'opdash_theme'
};

const App: React.FC = () => {
  // Inicialización inteligente: Si el key existe (incluso vacío), se usa. Si no, INITIAL.
  const [tareas, setTareas] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved !== null ? JSON.parse(saved) : INITIAL_TASKS;
  });
  
  const [historial, setHistorial] = useState<Task[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return saved !== null ? JSON.parse(saved) : INITIAL_HISTORIAL;
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sincronización con LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tareas));
  }, [tareas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historial));
  }, [historial]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.THEME, 'light');
    }
  }, [isDarkMode]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, message, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const updateTaskStatus = useCallback((id: string, newStatus: Status) => {
    setTareas(prev => {
      const taskIndex = prev.findIndex(t => t.id === id);
      if (taskIndex === -1) return prev;
      
      const oldTask = prev[taskIndex];
      
      if (newStatus !== 'Pendiente' && oldTask.prodTrab <= 0) {
        addNotification('Debe ingresar productos trabajados para cambiar el estatus.', 'error');
        return prev;
      }

      const updatedTasks = [...prev];
      const task = { ...oldTask, estatus: newStatus };
      
      if (newStatus === 'Terminado') {
        updatedTasks.splice(taskIndex, 1);
        setHistorial(h => [...h, task]);
        addNotification(`Tarea "${task.nombre}" completada y movida al historial`, 'success');
        return updatedTasks;
      }
      
      updatedTasks[taskIndex] = task;
      addNotification(`Tarea "${task.nombre}" ahora está en ${newStatus}`, 'info');
      return updatedTasks;
    });
  }, [addNotification]);

  const deleteTask = useCallback((id: string) => {
    if (confirm('¿Deseas eliminar esta tarea activa permanentemente?')) {
      setTareas(prev => {
        const task = prev.find(t => t.id === id);
        if (task) addNotification(`Tarea "${task.nombre}" eliminada`, 'warning');
        return prev.filter(t => t.id !== id);
      });
    }
  }, [addNotification]);

  // Función de limpieza de historial absoluta
  const clearHistory = useCallback(() => {
    if (confirm('¿Borrar definitivamente el historial? Esta acción actualizará todas las métricas de rendimiento y gráficas históricas.')) {
      setHistorial([]);
      addNotification('Historial vaciado correctamente', 'success');
    }
  }, [addNotification]);

  // Limpiar tareas activas
  const clearActiveTasks = () => {
    if (confirm('¿Deseas borrar todas las tareas activas? El backlog quedará en cero.')) {
      setTareas([]);
      addNotification('Tareas activas borradas', 'warning');
    }
  };

  // Restablecer TODO a valores iniciales (Demo)
  const resetToDemo = () => {
    if (confirm('¿Deseas restablecer la aplicación con los datos de ejemplo originales?')) {
      setTareas(INITIAL_TASKS);
      setHistorial(INITIAL_HISTORIAL);
      addNotification('Aplicación restablecida a modo demo', 'info');
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const saveTask = (taskData: Omit<Task, 'id'> & { id?: string }) => {
    if (taskData.id) {
      if (taskData.estatus === 'Terminado') {
        setTareas(prev => prev.filter(t => t.id !== taskData.id));
        setHistorial(h => [...h, taskData as Task]);
        addNotification(`Tarea "${taskData.nombre}" terminada y archivada`, 'success');
      } else {
        setTareas(prev => prev.map(t => t.id === taskData.id ? (taskData as Task) : t));
        addNotification(`Tarea "${taskData.nombre}" actualizada`, 'success');
      }
    } else {
      const newTask: Task = { ...taskData, id: Math.random().toString(36).substr(2, 9) };
      if (newTask.estatus === 'Terminado') {
        setHistorial(h => [...h, newTask]);
        addNotification(`Tarea "${newTask.nombre}" creada y archivada`, 'success');
      } else {
        setTareas(prev => [...prev, newTask]);
        addNotification(`Nueva tarea "${newTask.nombre}" creada`, 'success');
      }
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen pb-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className={`pointer-events-auto p-4 rounded-lg shadow-xl text-white font-medium text-sm flex items-center justify-between animate-in slide-in-from-right duration-300 ${n.type === 'success' ? 'bg-emerald-600' : n.type === 'error' ? 'bg-rose-600' : n.type === 'warning' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
            <span>{n.message}</span>
            <button onClick={() => setNotifications(prev => prev.filter(note => note.id !== n.id))} className="ml-4 opacity-70 hover:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        ))}
      </div>

      <header className="bg-indigo-700 dark:bg-indigo-900 text-white py-8 shadow-xl mb-8 border-b border-indigo-500/20">
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center">
              <span className="p-2 bg-indigo-500 rounded-lg mr-3 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </span>
              OpDash 
              <span className="font-light text-indigo-200 ml-2">KPI Dashboard</span>
            </h1>
            <p className="text-indigo-100 mt-1 opacity-80">Gestión de flujo de trabajo y productividad en tiempo real</p>
          </div>
          
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 bg-indigo-600 dark:bg-indigo-800 rounded-xl hover:bg-indigo-500 transition-all shadow-md" title="Alternar Modo Oscuro">
                {isDarkMode ? <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg> : <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
             </button>

             <button onClick={resetToDemo} className="p-3 bg-indigo-600 dark:bg-indigo-800 rounded-xl hover:bg-emerald-500 transition-all shadow-md" title="Restablecer Datos de Ejemplo">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>

             <button onClick={clearActiveTasks} className="p-3 bg-indigo-600 dark:bg-indigo-800 rounded-xl hover:bg-rose-500 transition-all shadow-md" title="Limpiar Tareas Activas">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
             </button>

             <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="bg-white text-indigo-700 px-5 py-3 rounded-xl font-bold flex items-center hover:bg-indigo-50 transition-all shadow-lg active:scale-95 group">
                <svg className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva Tarea
             </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-8">
        <SummaryCards tasks={tareas} history={historial} />
        <ChartsGrid tasks={tareas} history={historial} />
        <TaskTable tasks={tareas} onUpdateStatus={updateTaskStatus} onDeleteTask={deleteTask} onEditTask={openEditModal} />
        <HistoryTable history={historial} onClearHistory={clearHistory} />
      </main>

      <footer className="mt-12 text-center text-gray-400 dark:text-slate-500 text-sm mb-8">
        <p>&copy; {new Date().getFullYear()} OpDash - Gestión de Operaciones Avanzada</p>
      </footer>

      <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={saveTask} editingTask={editingTask} addNotification={addNotification} />
    </div>
  );
};

export default App;
