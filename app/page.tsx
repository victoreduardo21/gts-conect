'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  LayoutDashboard, 
  Plus, 
  Search, 
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Menu,
  X,
  TrendingUp,
  BarChart3,
  Pencil,
  Settings,
  LogOut,
  Sun,
  Moon,
  UserPlus,
  Users2,
  Filter,
  Target,
  Zap,
  Mail,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getClients, getProjects, getEmployees, getLeads, saveClient, saveProject, saveEmployee, saveLead, deleteEmployee, deleteLead, saveUserProfile } from '@/lib/storage';
import { Client, Project, Employee, Lead, LeadStage, Installment, ProjectStatus } from '@/lib/types';
import { format, isAfter, isBefore, addDays, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

type View = 'dashboard' | 'clients' | 'projects' | 'employees' | 'crm' | 'financial' | 'settings';

export default function NexusApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{name: string, email: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nexus_theme') as 'dark' | 'light';
      return savedTheme || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Form states
  const [showClientForm, setShowClientForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleOpenClientForm = (client?: Client) => {
    setEditingClient(client || null);
    setShowClientForm(true);
  };

  const handleOpenProjectForm = (project?: Project) => {
    setEditingProject(project || null);
    setShowProjectForm(true);
  };

  const handleOpenEmployeeForm = (employee?: Employee) => {
    setEditingEmployee(employee || null);
    setShowEmployeeForm(true);
  };

  const handleOpenLeadForm = (lead?: Lead) => {
    setEditingLead(lead || null);
    setShowLeadForm(true);
  };

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUser({
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário',
          email: firebaseUser.email || ''
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      const loadedClients = await getClients();
      const loadedProjects = await getProjects();
      const loadedEmployees = await getEmployees();
      const loadedLeads = await getLeads();
      
      setClients([...loadedClients]);
      setProjects([...loadedProjects]);
      setEmployees([...loadedEmployees]);
      setLeads([...loadedLeads]);
    };
    
    loadData();
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshData = async () => {
    const c = await getClients();
    const p = await getProjects();
    const e = await getEmployees();
    const l = await getLeads();
    setClients(c);
    setProjects(p);
    setEmployees(e);
    setLeads(l);
  };

  const handleSaveEmployee = async (employee: Employee) => {
    try {
      await saveEmployee(employee);
      await refreshData();
      setShowEmployeeForm(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Erro ao salvar funcionário.');
    }
  };

  const handleSaveLead = async (lead: Lead) => {
    try {
      await saveLead(lead);
      await refreshData();
      setShowLeadForm(false);
      setEditingLead(null);
    } catch (error) {
      console.error('Error saving lead:', error);
      alert('Erro ao salvar lead.');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (confirm('Deseja realmente remover este funcionário?')) {
      try {
        await deleteEmployee(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Deseja realmente remover este lead?')) {
      try {
        await deleteLead(id);
        await refreshData();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  const stats = {
    totalClients: clients.length,
    inProgress: projects.filter(p => {
      const today = new Date();
      const deadlineDate = parseISO(p.deadline);
      return p.status === 'em_andamento' && !isBefore(deadlineDate, today) && !isBefore(deadlineDate, addDays(today, 7));
    }).length,
    delayed: projects.filter(p => {
      if (p.status === 'concluido') return false;
      return isBefore(parseISO(p.deadline), new Date());
    }).length,
    nearDeadline: projects.filter(p => {
      if (p.status === 'concluido') return false;
      const today = new Date();
      const deadlineDate = parseISO(p.deadline);
      return !isBefore(deadlineDate, today) && isBefore(deadlineDate, addDays(today, 7));
    }).length,
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'projects', label: 'Projetos', icon: Briefcase },
    { id: 'employees', label: 'Funcionários', icon: Users2 },
    { id: 'crm', label: 'CRM / Leads', icon: Target },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView theme={theme} />;
  }

  return (
    <div className={`flex h-screen ${theme === 'dark' ? 'bg-[#050505] text-[#e0e0e0]' : 'bg-[#f4f7f6] text-[#333]'} font-sans transition-colors duration-300`}>
      {/* Sidebar */}
      <aside className={`bg-[#0d0d0d] border-white/5 border-r transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-serif italic text-white tracking-tight">
              GTS.Conect
            </h1>
          )}
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 transition-all rounded-lg hover:bg-white/10 text-white/50">
              <Menu size={20} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                ? 'bg-white/10 text-white font-medium'
                : 'text-white/40 hover:bg-white/5 hover:text-white/80'
              }`}
            >
              <item.icon size={18} className={activeView === item.id ? 'text-white' : ''} />
              {isSidebarOpen && <span className="ml-3 truncate text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 group relative">
          <div className="bg-white/5 rounded-2xl p-4 transition-all hover:bg-white/10">
            {isSidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold">
                    {user?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate w-24 text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs truncate w-24 text-white/30">{user?.email || 'nexus@business.com'}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all outline-none"
                  title="Sair"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleLogout} 
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center font-bold mx-auto transition-transform hover:scale-110 shadow-lg"
                title="Sair"
              >
                {user?.name.charAt(0) || 'U'}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <DashboardView stats={stats} projects={projects} theme={theme} key="dashboard" />
            )}
            {activeView === 'clients' && (
              <ClientsView 
                clients={clients} 
                onAdd={() => handleOpenClientForm()} 
                onEdit={handleOpenClientForm}
                theme={theme}
                key="clients" 
              />
            )}
            {activeView === 'projects' && (
              <ProjectsView 
                projects={projects} 
                clients={clients}
                employees={employees}
                onAdd={() => handleOpenProjectForm()} 
                onEdit={handleOpenProjectForm}
                onUpdate={refreshData}
                theme={theme}
                key="projects" 
              />
            )}
            {activeView === 'employees' && (
              <EmployeesView 
                employees={employees}
                onAdd={() => handleOpenEmployeeForm()}
                onEdit={handleOpenEmployeeForm}
                theme={theme}
                key="employees"
              />
            )}
            {activeView === 'crm' && (
              <LeadsView 
                leads={leads}
                onAdd={() => handleOpenLeadForm()}
                onEdit={handleOpenLeadForm}
                theme={theme}
                key="crm"
              />
            )}
            {activeView === 'financial' && (
              <FinancialView projects={projects} onUpdate={refreshData} theme={theme} key="financial" />
            )}
            {activeView === 'settings' && (
              <SettingsView 
                user={user} 
                isAuthenticated={isAuthenticated} 
                onLogout={handleLogout}
                theme={theme}
                setTheme={setTheme}
                key="settings" 
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Forms Modals */}
      {showClientForm && (
        <ClientForm 
          theme={theme}
          initialData={editingClient}
          onClose={() => {
            setShowClientForm(false);
            setEditingClient(null);
          }} 
          onSave={async (c: Client) => {
            try {
              await saveClient(c);
              await refreshData();
              setShowClientForm(false);
              setEditingClient(null);
            } catch (error) {
              console.error('Error saving client:', error);
              alert('Erro ao salvar cliente. Verifique sua conexão.');
            }
          }} 
        />
      )}

      {showProjectForm && (
        <ProjectForm 
          theme={theme}
          initialData={editingProject}
          clients={clients}
          employees={employees}
          onClose={() => {
            setShowProjectForm(false);
            setEditingProject(null);
          }} 
          onSave={async (p: Project) => {
            try {
              await saveProject(p);
              await refreshData();
              setShowProjectForm(false);
              setEditingProject(null);
            } catch (error) {
              console.error('Error saving project:', error);
              alert('Erro ao salvar projeto. Verifique sua conexão.');
            }
          }} 
        />
      )}

      {showEmployeeForm && (
        <EmployeeForm 
          theme={theme}
          initialData={editingEmployee}
          onClose={() => {
            setShowEmployeeForm(false);
            setEditingEmployee(null);
          }} 
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}

      {showLeadForm && (
        <LeadForm 
          theme={theme}
          initialData={editingLead}
          onClose={() => {
            setShowLeadForm(false);
            setEditingLead(null);
          }} 
          onSave={handleSaveLead}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  );
}

// --- View Components ---

function DashboardView({ stats, projects, theme }: { stats: any, projects: Project[], theme: string }) {
  const chartData = [
    { name: 'Em Andamento', value: stats.inProgress, color: '#818cf8' },
    { name: 'Atrasados', value: stats.delayed, color: '#ef4444' },
    { name: 'Perto do Prazo', value: stats.nearDeadline, color: '#fbbf24' },
  ];

  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header>
        <h2 className={`text-4xl font-serif italic leading-tight ${textColor}`}>Visão Geral</h2>
        <p className={`${subTextColor} mt-2 text-xs uppercase tracking-[0.2em]`}>Resumo da operação • {format(new Date(), 'dd MMMM, yyyy')}</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total de Clientes" 
          value={stats.totalClients} 
          icon={Users} 
          trend="+12% vs mês anterior" 
          theme={theme}
        />
        <StatCard 
          label="Em Andamento" 
          value={stats.inProgress} 
          icon={Clock} 
          theme={theme}
        />
        <StatCard 
          label="Atrasados" 
          value={stats.delayed} 
          icon={AlertCircle} 
          isAlert
          theme={theme}
        />
        <StatCard 
          label="Perto do Prazo" 
          value={stats.nearDeadline} 
          icon={Calendar} 
          isWarning
          theme={theme}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className={`${cardBg} p-8 rounded-2xl border`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-serif italic text-xl ${textColor}`}>Fluxo de Projetos</h3>
            <BarChart3 className={theme === 'dark' ? 'text-white/20' : 'text-slate-300'} size={18} />
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10}} 
                />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}} 
                  contentStyle={{backgroundColor: theme === 'dark' ? '#111' : '#fff', borderRadius: '12px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', color: theme === 'dark' ? '#fff' : '#333'}} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Financial Outlook */}
        <div className={`${cardBg} p-8 rounded-2xl border`}>
          <div className="flex items-center justify-between mb-8">
            <h3 className={`font-serif italic text-xl ${textColor}`}>Receita Prevista</h3>
            <TrendingUp className="text-emerald-500" size={18} />
          </div>
          <div className="space-y-6">
            <p className={`text-[10px] uppercase tracking-widest ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>Total Pendente</p>
            <p className={`text-4xl font-light font-mono tracking-tighter ${textColor}`}>
              R$ {projects.reduce((acc, p) => acc + p.installments.filter(i => i.status === 'pendente').reduce((sum, i) => sum + i.value, 0), 0)}
            </p>
            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} space-y-4`}>
              <div className="flex justify-between text-xs items-center">
                <span className={theme === 'dark' ? 'text-white/40' : 'text-slate-400'}>Projetos Ativos</span>
                <span className={`${textColor} ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'} px-2 py-0.5 rounded text-[10px] font-medium`}>{projects.filter(p => p.status !== 'concluido').length}</span>
              </div>
              <div className="flex justify-between text-xs items-center">
                <span className={theme === 'dark' ? 'text-white/40' : 'text-slate-400'}>Valor Médio</span>
                <span className={`${textColor} font-mono`}>R$ {(projects.reduce((acc, p) => acc + p.totalValue, 0) / (projects.length || 1)).toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, trend, isAlert, isWarning, theme }: any) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  
  return (
    <div className={`${cardBg} p-6 rounded-2xl border`}>
      <div className="flex items-start justify-between">
        <div className={`text-[10px] uppercase tracking-widest font-bold ${isAlert ? 'text-red-500' : isWarning ? 'text-amber-500' : theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
          {label}
        </div>
        <Icon size={16} className={isAlert ? 'text-red-400' : isWarning ? 'text-amber-400' : theme === 'dark' ? 'text-white/20' : 'text-slate-300'} />
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <p className={`text-3xl font-light tracking-tighter ${isAlert ? 'text-red-500' : isWarning ? 'text-amber-500' : textColor}`}>
          {value}
        </p>
        {trend && (
          <span className="text-[9px] font-medium text-emerald-500 opacity-80">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

function ClientsView({ clients, onAdd, onEdit, theme }: { clients: Client[], onAdd: () => void, onEdit: (c: Client) => void, theme: string }) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-serif italic ${textColor}`}>Clientes</h2>
          <p className={`${subTextColor} text-xs`}>Gestão da base de parceiros corporativos.</p>
        </div>
        <button 
          onClick={onAdd}
          className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:opacity-90 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg`}
        >
          Novo Cliente
        </button>
      </div>

      <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'} flex items-center`}>
          <Search size={14} className={theme === 'dark' ? 'text-white/20' : 'text-slate-300'} />
          <input 
            type="text" 
            placeholder="Pesquisar clientes..." 
            className={`flex-1 bg-transparent border-none focus:ring-0 text-xs ml-3 ${textColor} ${theme === 'dark' ? 'placeholder:text-white/20' : 'placeholder:text-slate-400'}`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.2em] font-bold border-b italic ${theme === 'dark' ? 'text-white/20 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                <th className="px-6 py-4">Empresa / Responsável</th>
                <th className="px-6 py-4">CNPJ</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-20 text-center text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`}>
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : clients.map(client => (
                <tr key={client.id} className={`border-b transition-colors group ${theme === 'dark' ? 'border-white/[0.02] hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-medium text-sm ${textColor}`}>{client.companyName}</div>
                    <div className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>{client.name}</div>
                  </td>
                  <td className={`px-6 py-4 font-mono text-[11px] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>{client.cnpj}</td>
                  <td className={`px-6 py-4 text-[11px] font-mono ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{client.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[9px] font-bold uppercase tracking-tighter">
                      Ativo
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(client)}
                      className={`p-2 transition-colors ${theme === 'dark' ? 'text-white/10 hover:text-white' : 'text-slate-300 hover:text-slate-900'}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function LeadsView({ leads, onAdd, onEdit, theme }: { leads: Lead[], onAdd: () => void, onEdit: (l: Lead) => void, theme: string }) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  const stages = {
    prospeccao: { label: 'Prospecção', color: 'bg-slate-500/10 text-slate-500' },
    contato: { label: 'Contato', color: 'bg-blue-500/10 text-blue-500' },
    proposta: { label: 'Proposta', color: 'bg-amber-500/10 text-amber-500' },
    negociacao: { label: 'Negociação', color: 'bg-indigo-500/10 text-indigo-500' },
    ganho: { label: 'Ganho', color: 'bg-emerald-500/10 text-emerald-500' },
    perdido: { label: 'Perdido', color: 'bg-red-500/10 text-red-500' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-4xl font-serif italic ${textColor}`}>CRM Pipeline</h2>
          <p className={`${subTextColor} text-sm mt-1`}>Monitore oportunidades e converta novos parceiros.</p>
        </div>
        <button 
          onClick={onAdd}
          className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:opacity-90 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl flex items-center gap-3`}
        >
          <Zap size={16} />
          <span>Nova Oportunidade</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.length === 0 ? (
          <div className={`${cardBg} col-span-full py-24 text-center rounded-[2.5rem] border border-dashed`}>
            <Target size={48} className="mx-auto mb-4 opacity-10" />
            <p className={`uppercase tracking-[0.3em] text-[10px] font-bold ${subTextColor}`}>O pipeline está vazio no momento</p>
          </div>
        ) : leads.map(lead => (
          <motion.div
            key={lead.id}
            whileHover={{ y: -5 }}
            className={`${cardBg} p-8 rounded-[2rem] border relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start mb-6">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${stages[lead.stage].color}`}>
                {stages[lead.stage].label}
              </span>
              <button 
                onClick={() => onEdit(lead)}
                className={`p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all ${theme === 'dark' ? 'hover:bg-white/10 text-white/40' : 'hover:bg-slate-100 text-slate-300'}`}
              >
                <Pencil size={14} />
              </button>
            </div>

            <div className="mb-8">
              <h4 className={`text-lg font-serif italic mb-1 ${textColor}`}>{lead.company}</h4>
              <p className={`text-xs ${subTextColor}`}>{lead.name}</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-white/30' : 'bg-slate-50 text-slate-400'}`}>
                  <DollarSign size={14} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Valor Estimado</p>
                  <p className={`text-sm font-mono ${textColor}`}>R$ {lead.estimatedValue.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 text-white/30' : 'bg-slate-50 text-slate-400'}`}>
                  <Calendar size={14} />
                </div>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Último Contato</p>
                  <p className={`text-sm ${textColor}`}>{format(parseISO(lead.lastContact), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </div>

            <div className={`pt-6 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'} flex items-center justify-between`}>
              <div className="flex -space-x-1">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white uppercase border-2 border-[#111]">
                  {lead.source?.charAt(0) || 'L'}
                </div>
              </div>
              <p className={`text-[9px] uppercase font-bold tracking-widest ${subTextColor}`}>{lead.source}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function EmployeesView({ employees, onAdd, onEdit, theme }: { employees: Employee[], onAdd: () => void, onEdit: (e: Employee) => void, theme: string }) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-serif italic ${textColor}`}>Funcionários</h2>
          <p className={`${subTextColor} text-xs`}>Equipe operacional e talentos vinculados.</p>
        </div>
        <button 
          onClick={onAdd}
          className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:opacity-90 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center gap-2`}
        >
          <UserPlus size={14} />
          <span>Contratar</span>
        </button>
      </div>

      <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
        <div className={`p-4 border-b ${theme === 'dark' ? 'border-white/5 bg-white/2' : 'border-slate-100 bg-slate-50/50'} flex items-center`}>
          <Search size={14} className={theme === 'dark' ? 'text-white/20' : 'text-slate-300'} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou cargo..." 
            className={`flex-1 bg-transparent border-none focus:ring-0 text-xs ml-3 ${textColor} ${theme === 'dark' ? 'placeholder:text-white/20' : 'placeholder:text-slate-400'}`}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.2em] font-bold border-b italic ${theme === 'dark' ? 'text-white/20 border-white/5' : 'text-slate-400 border-slate-100'}`}>
                <th className="px-6 py-4">Nome / Cargo</th>
                <th className="px-6 py-4">E-mail</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-20 text-center text-xs uppercase tracking-widest ${theme === 'dark' ? 'text-white/20' : 'text-slate-300'}`}>
                    Nenhum colaborador cadastrado
                  </td>
                </tr>
              ) : employees.map(emp => (
                <tr key={emp.id} className={`border-b transition-colors group ${theme === 'dark' ? 'border-white/[0.02] hover:bg-white/[0.02]' : 'border-slate-50 hover:bg-slate-50'}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px] ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${textColor}`}>{emp.name}</div>
                        <div className={`text-[10px] uppercase tracking-wider ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-[11px] font-mono ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{emp.email}</td>
                  <td className={`px-6 py-4 text-[11px] font-mono ${theme === 'dark' ? 'text-white/60' : 'text-slate-500'}`}>{emp.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-tighter">
                      No Time
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEdit(emp)}
                      className={`p-2 transition-colors ${theme === 'dark' ? 'text-white/10 hover:text-white' : 'text-slate-300 hover:text-slate-900'}`}
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function ProjectsView({ 
  projects, 
  clients, 
  employees,
  onAdd, 
  onEdit, 
  onUpdate,
  theme
}: { 
  projects: Project[], 
  clients: Client[], 
  employees: Employee[],
  onAdd: () => void, 
  onEdit: (p: Project) => void, 
  onUpdate: () => void,
  theme: string
}) {
  const updateStatus = async (id: string, stage: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      const newProgress = status === 'concluido' ? 100 : project.progress;
      await saveProject({ ...project, stage, status, progress: newProgress });
      onUpdate();
    }
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-3xl font-serif italic ${textColor}`}>Projetos</h2>
          <p className={`${subTextColor} text-xs lowercase`}>Cronogramas e estágios de desenvolvimento.</p>
        </div>
        <button 
          onClick={onAdd}
          className={`${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} hover:opacity-90 px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg`}
        >
          Novo Projeto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className={`col-span-full py-20 text-center rounded-2xl border border-dashed text-xs uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/20 bg-[#111] border-white/10' : 'text-slate-300 bg-white border-slate-200'}`}>
            Lista de projetos vazia
          </div>
        ) : projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onStatusChange={updateStatus} 
            onEdit={onEdit}
            theme={theme}
            employees={employees}
          />
        ))}
      </div>
    </motion.div>
  );
}

function ProjectCard({ project, onStatusChange, onEdit, theme, employees }: { project: Project, onStatusChange: any, onEdit: (p: Project) => void, theme: string, employees: Employee[] }) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';

  const assignedEmployees = employees.filter(e => project.assignedEmployeeIds?.includes(e.id));

  // Cálculo automático de status baseado no prazo
  const getAutoStatus = () => {
    if (project.status === 'concluido') return 'concluido';
    const today = new Date();
    const deadlineDate = parseISO(project.deadline);
    if (isBefore(deadlineDate, today)) return 'atrasado';
    const nearDeadline = isBefore(deadlineDate, addDays(today, 7));
    if (nearDeadline) return 'proximo_ao_prazo';
    return project.status;
  };

  const currentStatus = getAutoStatus();

  const statusColors = {
    em_andamento: theme === 'dark' ? 'text-indigo-400 bg-indigo-500/10' : 'text-indigo-600 bg-indigo-500/10',
    atrasado: theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-500 bg-red-500/10',
    proximo_ao_prazo: theme === 'dark' ? 'text-yellow-400 bg-amber-500/10' : 'text-amber-500 bg-amber-500/10',
    concluido: theme === 'dark' ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-500/10',
  };

  const statusLabels = {
    em_andamento: 'Em Andamento',
    atrasado: 'Atrasado',
    proximo_ao_prazo: 'Próximo ao Prazo',
    concluido: 'Concluído'
  };

  return (
    <div className={`${cardBg} p-6 rounded-2xl border flex flex-col h-full border-t-2 ${currentStatus === 'concluido' ? 'border-t-emerald-500' : 'border-t-indigo-500'} transition-all ${theme === 'dark' ? 'hover:border-white/10' : 'hover:border-slate-300'}`}>
      <div className="flex justify-between items-start mb-6">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusColors[currentStatus]}`}>
          {statusLabels[currentStatus]}
        </span>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onEdit(project)}
            className={`transition-colors ${theme === 'dark' ? 'text-white/10 hover:text-indigo-400' : 'text-slate-300 hover:text-indigo-500'}`}
          >
            <Pencil size={14} />
          </button>
          <div className={`flex items-center text-[10px] font-mono ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>
            <Calendar size={12} className="mr-1.5" />
            {format(parseISO(project.deadline), 'dd/MM/yy')}
          </div>
        </div>
      </div>

      <h3 className={`font-serif italic text-lg leading-tight mb-1 ${textColor}`}>{project.name}</h3>
      <p className={`text-[10px] uppercase tracking-widest mb-4 ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>{project.clientName}</p>
      
      <div className="flex-1">
        <p className={`text-xs line-clamp-2 mb-6 font-light leading-relaxed ${theme === 'dark' ? 'text-white/50' : 'text-slate-600'}`}>{project.description}</p>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest">
            <span className={theme === 'dark' ? 'text-white/40' : 'text-slate-400'}>{project.stage || 'Sem Estágio'}</span>
            <span className="text-indigo-500">{(project.progress || 0)}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${project.progress || 0}%` }}
              className={`${currentStatus === 'concluido' ? 'bg-emerald-500' : 'bg-indigo-500'} h-full`} 
            />
          </div>
        </div>

        {project.lastUpdate && (
          <div className={`mb-6 p-4 rounded-xl border border-dashed ${theme === 'dark' ? 'bg-white/[0.02] border-white/10' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[9px] uppercase font-black tracking-widest mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Última Atualização</p>
            <p className={`text-[11px] leading-relaxed italic ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}>
              &quot;{project.lastUpdate}&quot;
            </p>
          </div>
        )}

        {/* Assigned Employees Mini List */}
        {assignedEmployees.length > 0 && (
          <div className="mb-6">
            <p className={`text-[9px] uppercase font-bold tracking-widest mb-3 ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Equipe Designada</p>
            <div className="flex -space-x-2">
              {assignedEmployees.map((emp) => (
                <div 
                  key={emp.id} 
                  title={`${emp.name} - ${emp.role}`}
                  className={`w-8 h-8 rounded-full border-2 ${theme === 'dark' ? 'border-[#111] bg-white/10 text-white' : 'border-white bg-slate-100 text-slate-900'} flex items-center justify-center text-[10px] font-bold`}
                >
                  {emp.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={`pt-6 border-t flex items-center justify-between ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
        <div>
          <p className={`text-[9px] uppercase font-bold tracking-widest mb-1 ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Budget</p>
          <p className={`text-sm font-mono font-bold ${textColor}`}>R$ {project.totalValue.toLocaleString()}</p>
        </div>
        <select 
          className={`text-[10px] border rounded p-1 font-bold uppercase cursor-pointer outline-none transition-colors ${theme === 'dark' ? 'bg-black/40 border-white/10 text-white/60 hover:border-white/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-500'}`}
          value={project.status}
          onChange={(e) => onStatusChange(project.id, project.stage, e.target.value)}
        >
          <option value="em_andamento">Andamento</option>
          <option value="atrasado">Atrasado</option>
          <option value="proximo_ao_prazo">Prazo</option>
          <option value="concluido">Concluído</option>
        </select>
      </div>
    </div>
  );
}

function SettingsView({ user, isAuthenticated, onLogout, theme, setTheme }: any) {
  const cardBg = theme === 'dark' ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/50';
  const subCardBg = theme === 'dark' ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-100';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const labelColor = theme === 'dark' ? 'text-white/40' : 'text-slate-400';
  const subTextColor = theme === 'dark' ? 'text-white/30' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12"
    >
      <header>
        <h2 className={`text-4xl font-serif italic flex items-center gap-4 ${textColor}`}>
          <Settings size={32} className={theme === 'dark' ? 'text-white/10' : 'text-slate-200'} />
          Configurações
        </h2>
        <p className={`${subTextColor} text-xs mt-2 uppercase tracking-widest font-bold`}>Gestão de Perfil e Conexões do Sistema</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Aparência do Sistema */}
          <section className={`${cardBg} p-10 rounded-[2.5rem] border shadow-xl`}>
            <h4 className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 ${labelColor}`}>Personalização Visual</h4>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setTheme('light')}
                className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 ${theme === 'light' ? 'bg-slate-100 border-indigo-500 shadow-md ring-2 ring-indigo-500/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className={`w-12 h-12 rounded-full shadow-sm flex items-center justify-center ${theme === 'light' ? 'bg-white text-indigo-600' : 'bg-white text-slate-400'}`}>
                  <Sun size={24} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-indigo-600' : 'text-slate-400'}`}>Tema Claro</span>
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`p-6 rounded-2xl border transition-all flex flex-col items-center gap-4 ${theme === 'dark' ? 'bg-white/5 border-indigo-500 shadow-xl ring-2 ring-indigo-500/10' : 'bg-black/20 border-white/5 hover:bg-white/10'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-black text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <Moon size={24} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-indigo-400' : 'text-white/20'}`}>Tema Escuro</span>
              </button>
            </div>
          </section>

          {/* Status do Ecossistema */}
          <section className={`${cardBg} p-10 rounded-[2.5rem] border shadow-xl relative overflow-hidden group`}>
            <div className="absolute -top-10 -right-10 opacity-[0.02] transition-opacity">
              <Users size={240} className={textColor} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-8 mb-10">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl font-bold shadow-2xl rotate-3 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <h3 className={`text-2xl font-serif italic mb-1 ${textColor}`}>{user?.name}</h3>
                  <p className={`font-mono text-xs ${subTextColor}`}>{user?.email}</p>
                </div>
              </div>

              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t ${theme === 'dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <div className={`${subCardBg} p-6 rounded-2xl border flex flex-col justify-between`}>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <LogOut size={16} className={labelColor} />
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${labelColor}`}>Sessão</span>
                    </div>
                    <p className={`font-serif italic text-sm ${textColor}`}>{user?.name} via Nuvem</p>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="mt-6 w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest border border-red-500/20"
                  >
                    Sair do Sistema
                  </button>
                </div>
                <div className={`${subCardBg} p-6 rounded-2xl border`}>
                  <div className={`flex items-center gap-3 mb-3 ${labelColor}`}>
                    <DollarSign size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Nível de Acesso</span>
                  </div>
                  <p className={`font-serif italic ${textColor}`}>Enterprise</p>
                </div>
              </div>
            </div>
          </section>

          <section className={`${cardBg} p-10 rounded-[2.5rem] border`}>
            <h4 className={`text-xs font-bold uppercase tracking-[0.3em] mb-8 ${labelColor}`}>Preferências do Sistema</h4>
            <div className="space-y-6">
              <div className={`flex items-center justify-between py-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>Notificações por Email</p>
                  <p className={`${subTextColor} text-[10px]`}>Alertas de prazos e parcelas atrasadas.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative p-1 cursor-not-allowed ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full ml-auto" />
                </div>
              </div>
              <div className={`flex items-center justify-between py-4 border-b ${theme === 'dark' ? 'border-white/5' : 'border-slate-50'}`}>
                <div>
                  <p className={`text-sm font-medium ${textColor}`}>Backup Automático</p>
                  <p className={`${subTextColor} text-[10px]`}>Sincronização em tempo real com Firestore.</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative p-1 cursor-not-allowed ${theme === 'dark' ? 'bg-emerald-500/20' : 'bg-emerald-500/10'}`}>
                  <div className="w-4 h-4 bg-emerald-500 rounded-full ml-auto" />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${cardBg} p-8 rounded-[2rem] border shadow-sm`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-6 ${labelColor}`}>Conta e Segurança</p>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 border border-red-500/10"
            >
              <LogOut size={16} />
              Encerrar Sessão
            </button>
          </section>

          <section className={`p-8 rounded-[2rem] border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100/50 border-slate-200'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-widest mb-4 ${labelColor}`}>Informação Técnica</p>
            <div className={`space-y-2 font-mono text-[9px] uppercase ${subTextColor}`}>
              <p>Versão: 2.1.4-build</p>
              <p>ID: gts-conect-prd</p>
              <p>Região: us-east-1</p>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function FinancialView({ projects, onUpdate, theme }: { projects: Project[], onUpdate: () => void, theme: string }) {
  const allInstallments = projects.flatMap(p => 
    p.installments.map(i => ({ ...i, projectId: p.id, projectName: p.name, clientName: p.clientName }))
  ).sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());

  const handleConciliar = async (projectId: string, installmentId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      const updatedInstallments = project.installments.map(inst => 
        inst.id === installmentId ? { ...inst, status: 'pago' as const } : inst
      );

      const updatedProject = { ...project, installments: updatedInstallments };
      await saveProject(updatedProject);
      await onUpdate();
      alert('Parcela conciliada com sucesso!');
    } catch (error) {
      console.error('Erro ao conciliar parcela:', error);
      alert('Ocorreu um erro ao conciliar a parcela.');
    }
  };

  const totalRevenue = allInstallments.filter(i => i.status === 'pago').reduce((acc, i) => acc + i.value, 0);
  const totalPending = allInstallments.filter(i => i.status === 'pendente').reduce((acc, i) => acc + i.value, 0);
  const totalAtrasado = allInstallments.filter(i => i.status === 'pendente' && isBefore(parseISO(i.dueDate), new Date())).reduce((acc, i) => acc + i.value, 0);

  const statusData = [
    { name: 'Recebido', value: totalRevenue, color: '#10b981' },
    { name: 'Pendente', value: totalPending - totalAtrasado, color: '#6366f1' },
    { name: 'Atrasado', value: totalAtrasado, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Monthly breakdown for AreaChart
  const monthlyBreakdown: any[] = [];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  
  monthNames.forEach((month, idx) => {
    const paid = allInstallments
      .filter(i => i.status === 'pago' && parseISO(i.dueDate).getMonth() === idx)
      .reduce((acc, i) => acc + i.value, 0);
    const pending = allInstallments
      .filter(i => i.status === 'pendente' && parseISO(i.dueDate).getMonth() === idx)
      .reduce((acc, i) => acc + i.value, 0);
    
    if (paid > 0 || pending > 0) {
      monthlyBreakdown.push({ name: month, pago: paid, previsto: paid + pending });
    }
  });

  const cardBg = theme === 'dark' ? 'bg-[#0a0a0a] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-sm';
  const textColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-white/40' : 'text-slate-500';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-12"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4 ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
            <Activity size={12} />
            Real-time Finance
          </div>
          <h2 className={`text-5xl font-serif italic leading-none tracking-tighter ${textColor}`}>Fluxo de Ativos</h2>
          <p className={`${subTextColor} text-xs mt-3 uppercase tracking-widest font-medium max-w-md`}>Monitoramento de liquidez, recebíveis e performance financeira da GTS.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`${cardBg} px-6 py-4 rounded-2xl border flex items-center gap-4`}>
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="text-emerald-500" size={20} />
            </div>
            <div>
              <p className={`text-[9px] font-black uppercase tracking-widest ${subTextColor}`}>Previsão Mês</p>
              <p className={`text-lg font-mono font-bold ${textColor}`}>
                R$ {allInstallments.length > 0 ? (allInstallments.reduce((acc, i) => acc + i.value, 0) / 12).toFixed(0).toLocaleString() : '0'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Recebido', value: totalRevenue, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Em Aberto', value: totalPending - totalAtrasado, icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Total Atrasado', value: totalAtrasado, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/5' },
          { label: 'Média Mensal', value: allInstallments.length > 0 ? totalRevenue / 12 : 0, icon: TrendingUp, color: 'text-slate-400', bg: 'bg-slate-500/5' },
        ].map((kpi, i) => (
          <div key={i} className={`${cardBg} p-6 rounded-2xl border relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-24 h-24 ${kpi.bg} rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4">
                <kpi.icon className={kpi.color} size={18} />
                <ArrowUpRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${subTextColor}`}>{kpi.label}</p>
                <p className={`text-xl font-mono font-bold ${textColor}`}>R$ {kpi.value.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${cardBg} lg:col-span-2 p-8 rounded-3xl border`}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className={`font-serif italic text-2xl ${textColor}`}>Performance de Receita</h3>
              <p className={`text-[10px] uppercase font-bold tracking-widest mt-1 ${subTextColor}`}>Projeção vs Liquidado por mês</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${subTextColor}`}>Liquidado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className={`text-[9px] font-bold uppercase tracking-widest ${subTextColor}`}>Previsto</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyBreakdown}>
                <defs>
                  <linearGradient id="colorPago" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 700}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', fontSize: '11px'}}
                  itemStyle={{fontWeight: 700}}
                />
                <Area type="monotone" dataKey="previsto" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPrevisto)" />
                <Area type="monotone" dataKey="pago" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPago)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardBg} p-8 rounded-3xl border flex flex-col`}>
          <h3 className={`font-serif italic text-2xl mb-2 ${textColor}`}>Distribuição</h3>
          <p className={`text-[10px] uppercase font-bold tracking-widest mb-8 ${subTextColor}`}>Status dos Ativos</p>
          
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={10}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', fontSize: '10px'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4 mt-6">
            {statusData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: d.color}} />
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>{d.name}</span>
                </div>
                <span className={`text-xs font-mono font-bold ${textColor}`}>{((d.value / (totalRevenue + totalPending)) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`${cardBg} rounded-3xl border overflow-hidden`}>
        <div className={`p-8 border-b flex flex-col md:flex-row md:items-center justify-between gap-6 ${theme === 'dark' ? 'border-white/5 bg-white/[0.01]' : 'border-slate-100 bg-slate-50/20'}`}>
          <div>
            <h3 className={`font-serif italic text-2xl leading-tight ${textColor}`}>Parcelas Analíticas</h3>
            <p className={`${subTextColor} text-[10px] uppercase font-bold tracking-widest mt-1`}>Histórico detalhado de faturamento</p>
          </div>
          <div className="flex items-center gap-4">
             <div className={`flex p-1 rounded-xl border ${theme === 'dark' ? 'bg-[#050505] border-white/5' : 'bg-slate-100 border-slate-200'}`}>
              <button className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-lg transition-all ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-white text-slate-800 shadow-sm'}`}>Tudo</button>
              <button className={`text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 transition-colors ${theme === 'dark' ? 'text-white/20 hover:text-white/40' : 'text-slate-400 hover:text-slate-600'}`}>Este Mês</button>
            </div>
            <button className={`p-2.5 rounded-xl border ${theme === 'dark' ? 'border-white/5 text-white/40 hover:text-white' : 'border-slate-200 text-slate-400 hover:text-slate-900 shadow-sm transition-all'}`}>
              <Filter size={18} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`text-[10px] uppercase tracking-[0.3em] font-black border-b italic ${theme === 'dark' ? 'text-white/20 border-white/5 bg-white/[0.02]' : 'text-slate-400 border-slate-100 bg-slate-50/50'}`}>
                <th className="px-8 py-6">ID / Vencimento</th>
                <th className="px-8 py-6">Projeto / Cliente</th>
                <th className="px-8 py-6">Valor Nominal</th>
                <th className="px-8 py-6">Status Liquidez</th>
                <th className="px-8 py-6 text-right">Conciliação</th>
              </tr>
            </thead>
            <tbody className={theme === 'dark' ? 'text-white/70' : 'text-slate-600'}>
              {allInstallments.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`py-32 text-center text-[10px] uppercase tracking-[0.4em] font-black italic ${theme === 'dark' ? 'text-white/10' : 'text-slate-200'}`}>
                    - Data Warehouse Vazio -
                  </td>
                </tr>
              ) : allInstallments.map((item, idx) => (
                <tr key={`${item.id}-${idx}`} className={`border-b transition-all group ${theme === 'dark' ? 'border-white/[0.02] hover:bg-white/[0.03]' : 'border-slate-50 hover:bg-slate-50'}`}>
                  <td className="px-8 py-6">
                    <div className={`text-[11px] font-mono font-bold mb-1 ${item.status === 'pendente' && isBefore(parseISO(item.dueDate), new Date()) ? 'text-red-500' : textColor}`}>
                      {format(parseISO(item.dueDate), 'dd/MM/yyyy')}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest font-bold opacity-30">TC-{item.id}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`text-sm font-serif italic mb-1 group-hover:translate-x-1 transition-transform ${textColor}`}>{item.projectName}</div>
                    <div className={`text-[9px] uppercase font-bold tracking-widest ${subTextColor}`}>{item.clientName}</div>
                  </td>
                  <td className={`px-8 py-6 text-sm font-mono font-bold ${item.status === 'pago' ? 'text-emerald-500' : textColor}`}>
                    R$ {item.value.toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      item.status === 'pago' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20' : 
                      item.status === 'atrasado' || (isBefore(parseISO(item.dueDate), new Date()) && item.status === 'pendente') ? 'bg-red-500/5 text-red-500 border-red-500/20' : 
                      'bg-indigo-500/5 text-indigo-400 border-indigo-500/20'
                    }`}>
                      <div className={`w-1 h-1 rounded-full animate-pulse ${
                        item.status === 'pago' ? 'bg-emerald-500' : 
                        item.status === 'pendente' && isBefore(parseISO(item.dueDate), new Date()) ? 'bg-red-500' : 'bg-indigo-500'
                      }`} />
                      {item.status === 'pendente' && isBefore(parseISO(item.dueDate), new Date()) ? 'Inadimplente' : item.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {item.status === 'pendente' ? (
                      <button 
                        onClick={() => handleConciliar(item.projectId, item.id)}
                        className={`text-[9px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl border transition-all active:scale-95 shadow-sm group-hover:shadow-md ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800'}`}
                      >
                        Liquidado
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-emerald-500 font-black italic text-[9px] uppercase tracking-widest">
                        <CheckCircle2 size={14} />
                        Consolidado
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function LoginView({ theme }: { theme: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        // Save profile to Firestore
        await saveUserProfile(userCredential.user.uid, {
          name: name || email.split('@')[0],
          email: email,
          role: 'user'
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('O login por E-mail/Senha não está ativado no Firebase Console.');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro. Tente novamente mais tarde.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f4f7f6]'} flex flex-col items-center justify-center p-6 transition-colors duration-300`}>
      <div className="w-full max-w-md space-y-12">
        <header className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-20 ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} rounded-[2rem] mx-auto flex items-center justify-center rotate-12 shadow-2xl`}
          >
            <div className={`w-12 h-12 ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} rounded-xl rotate-[-12deg] flex items-center justify-center font-serif text-2xl italic`}>G</div>
          </motion.div>
          <div>
            <h1 className={`text-4xl font-serif italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>GTS.Conect</h1>
            <p className={`${theme === 'dark' ? 'text-white/30' : 'text-slate-400'} text-xs uppercase tracking-[0.3em] mt-2 font-bold`}>Enterprise Software Solution</p>
          </div>
        </header>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${theme === 'dark' ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'} p-10 rounded-[2.5rem] border space-y-8 shadow-2xl relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.02]">
            <Users size={80} className={theme === 'dark' ? 'text-white' : 'text-black'} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <h2 className={`text-xl font-serif italic mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
              {isRegistering ? 'Criar Nova Conta' : 'Acessar Sistema'}
            </h2>

            <div className="space-y-6">
              {isRegistering && (
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>Nome Completo</label>
                  <input 
                    type="text" 
                    required 
                    className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-6 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all`}
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>E-mail Corporativo</label>
                <input 
                  type="email" 
                  required 
                  className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-6 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all`}
                  placeholder="ex: admin@gts.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${theme === 'dark' ? 'text-white/30' : 'text-slate-400'}`}>Senha de Acesso</label>
                <input 
                  type="password" 
                  required 
                  className={`w-full ${theme === 'dark' ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-6 rounded-2xl text-sm outline-none focus:border-indigo-500 transition-all`}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
               <p className="text-red-500 text-[10px] text-center uppercase tracking-widest font-bold">
                 {error}
               </p>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'} py-5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] transition-all hover:opacity-90 active:scale-[0.98] shadow-xl disabled:opacity-50`}
            >
              {isLoading ? 'Processando...' : (isRegistering ? 'Cadastrar' : 'Entrar')}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className={`w-full text-[10px] uppercase font-bold tracking-widest transition-colors ${theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
            >
              {isRegistering ? 'Já tenho uma conta • Entrar' : 'Não tem uma conta? • Criar'}
            </button>
          </form>
        </motion.div>

        <footer className="text-center mt-12 space-y-2">
          <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/10' : 'text-slate-300'}`}>© 2026 GTS Global Tech Software</p>
          <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-white/10' : 'text-slate-300'}`}>Acesso Restrito • Monitorado</p>
        </footer>
      </div>
    </div>
  );
}

// --- Forms ---

function LeadForm({ onClose, onSave, onDelete, initialData, theme }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    stage: initialData?.stage || 'prospeccao',
    estimatedValue: initialData?.estimatedValue || 0,
    source: initialData?.source || 'Orgânico',
    notes: initialData?.notes || '',
    lastContact: initialData?.lastContact || new Date().toISOString().split('T')[0]
  });

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-slate-900/20'} backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${theme === 'dark' ? 'bg-[#111] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300/50'} w-full max-w-2xl rounded-[2rem] p-10 border max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className={`text-2xl font-serif italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Refinar Oportunidade' : 'Novos Horizontes'}</h3>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-bold ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Gestão Prospectiva de Clientes</p>
          </div>
          <button onClick={onClose} className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white/20 hover:text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-slate-900'}`}><X size={20} /></button>
        </div>
        
        <form className="space-y-8" onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...formData,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            createdAt: initialData?.createdAt || new Date().toISOString()
          });
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Empresa Potencial</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all placeholder:opacity-20`} 
                placeholder="Ex: Arasaka Corp"
                value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Contato Direto</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all placeholder:opacity-20`} 
                placeholder="Ex: Adam Smasher"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Estágio do Funil</label>
              <select required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all appearance-none`} 
                value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as LeadStage})}>
                <option value="prospeccao">Prospecção</option>
                <option value="contato">Primeiro Contato</option>
                <option value="proposta">Proposta Enviada</option>
                <option value="negociacao">Em Negociação</option>
                <option value="ganho">Contrato Fechado (Ganho)</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Valor Estimado (R$)</label>
              <input type="number" required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.estimatedValue} onChange={e => setFormData({...formData, estimatedValue: parseFloat(e.target.value)})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Origem do Lead</label>
              <input className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="Ex: Linkedin, Indicação..."
                value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Data do Último Contato</label>
              <input type="date" required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.lastContact} onChange={e => setFormData({...formData, lastContact: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Anotações Estratégicas</label>
            <textarea className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-4 px-5 rounded-2xl text-sm focus:border-indigo-500 outline-none min-h-[120px] transition-all placeholder:opacity-20`} 
              placeholder="Descreva o andamento da conversa..."
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>

          <div className="pt-6 flex gap-4">
            {initialData && (
              <button 
                type="button" 
                onClick={() => onDelete(initialData.id)}
                className="flex-1 border border-red-500/20 text-red-500 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-[0.98]"
              >
                Descartar Lead
              </button>
            )}
            <button type="submit" className={`flex-[2] ${theme === 'dark' ? 'bg-white text-black font-black' : 'bg-slate-900 text-white font-black shadow-xl shadow-slate-200'} py-5 rounded-2xl text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-[0.98]`}>
              {initialData ? 'Atualizar Pipeline' : 'Consolidar Oportunidade'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ClientForm({ onClose, onSave, initialData, theme }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    companyName: initialData?.companyName || '',
    cnpj: initialData?.cnpj || '',
    email: initialData?.email || '',
    phone: initialData?.phone || ''
  });

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-slate-900/20'} backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${theme === 'dark' ? 'bg-[#111] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300/50'} w-full max-w-md rounded-2xl p-8 border`}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-serif italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Editar Cliente' : 'Novo Cliente'}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white/20 hover:text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-slate-900'}`}><X size={18} /></button>
        </div>
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...formData,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            createdAt: initialData?.createdAt || new Date().toISOString()
          });
        }}>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Responsável</label>
            <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
              placeholder="Ex: John Doe"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Razão Social</label>
            <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
              placeholder="Ex: Nexus Corp"
              value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>CNPJ</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="00.000.000/0001-00"
                value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Telefone</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="(00) 00000-0000"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Email Corporativo</label>
            <input required type="email" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
              placeholder="contato@nexus.com"
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <button type="submit" className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-lg'} py-4 rounded-lg font-bold text-xs uppercase tracking-widest mt-4 hover:opacity-90 transition-all active:scale-[0.98]`}>
            {initialData ? 'Atualizar Cliente' : 'Cadastrar Cliente'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function EmployeeForm({ onClose, onSave, onDelete, initialData, theme }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    role: initialData?.role || '',
    email: initialData?.email || '',
    phone: initialData?.phone || ''
  });

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-slate-900/20'} backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${theme === 'dark' ? 'bg-[#111] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300/50'} w-full max-w-md rounded-2xl p-8 border`}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-serif italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Editar Colaborador' : 'Novo Colaborador'}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white/20 hover:text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-slate-900'}`}><X size={18} /></button>
        </div>
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...formData,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            createdAt: initialData?.createdAt || new Date().toISOString()
          });
        }}>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Nome do Colaborador</label>
            <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
              placeholder="Ex: Pedro Henrique"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Cargo / Função</label>
            <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
              placeholder="Ex: Designer UI/UX"
              value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>E-mail</label>
              <input required type="email" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="pedro@gts.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Telefone</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="(00) 00000-0000"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          
          <div className="pt-4 flex gap-3">
            {initialData && (
              <button 
                type="button" 
                onClick={() => onDelete(initialData.id)}
                className="flex-1 border border-red-500/20 text-red-500 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-[0.98]"
              >
                Remover
              </button>
            )}
            <button type="submit" className={`flex-[2] ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-lg'} py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98]`}>
              {initialData ? 'Salvar Alterações' : 'Contratar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ProjectForm({ onClose, onSave, clients, employees, initialData, theme }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    clientId: initialData?.clientId || '',
    description: initialData?.description || '',
    totalValue: initialData?.totalValue || 0,
    deadline: initialData?.deadline || '',
    installmentsCount: initialData?.installments?.length || 1,
    stage: initialData?.stage || 'Início',
    progress: initialData?.progress || 0,
    lastUpdate: initialData?.lastUpdate || '',
    status: initialData?.status || 'em_andamento',
    startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
    assignedEmployeeIds: initialData?.assignedEmployeeIds || []
  });

  const toggleEmployee = (id: string) => {
    setFormData(prev => ({
      ...prev,
      assignedEmployeeIds: prev.assignedEmployeeIds.includes(id)
        ? prev.assignedEmployeeIds.filter((eid: string) => eid !== id)
        : [...prev.assignedEmployeeIds, id]
    }));
  };

  return (
    <div className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/80' : 'bg-slate-900/40'} backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={`${theme === 'dark' ? 'bg-[#111] border-white/5 shadow-black' : 'bg-white border-slate-200 shadow-2xl shadow-slate-300/50'} w-full max-w-2xl rounded-2xl p-8 border max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className={`text-xl font-serif italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{initialData ? 'Editar Projeto' : 'Novo Projeto'}</h3>
          <button onClick={onClose} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-white/5 text-white/20 hover:text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-slate-900'}`}><X size={18} /></button>
        </div>
        <form className="space-y-8" onSubmit={(e) => {
          e.preventDefault();
          
          const client = clients.find((c: Client) => c.id === formData.clientId);
          const clientName = client ? client.companyName : '';

          // Only regenerate installments if not editing or if count changed
          let installments = initialData?.installments || [];
          if (!initialData || formData.installmentsCount !== initialData.installments.length) {
            installments = [];
            const installValue = formData.totalValue / formData.installmentsCount;
            for (let i = 0; i < formData.installmentsCount; i++) {
              installments.push({
                id: Math.random().toString(36).substr(2, 5),
                value: installValue,
                dueDate: addDays(new Date(), (i + 1) * 30).toISOString(),
                status: 'pendente'
              });
            }
          }

          onSave({
            ...formData,
            clientName,
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            installments
          });
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Título do Projeto</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all placeholder:opacity-20`} 
                placeholder="Ex: Desenvolvimento Web"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Cliente Vinculado</label>
              <select required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all appearance-none`} 
                value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                <option value="">Selecione um cliente</option>
                {clients.map((c: Client) => (
                  <option key={c.id} value={c.id} className={theme === 'dark' ? 'bg-[#111]' : 'bg-white text-slate-900'}>{c.companyName}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Escopo / Descrição</label>
            <textarea required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none min-h-[100px] transition-all placeholder:opacity-20`} 
              placeholder="Detalhes do projeto..."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Status do Projeto</label>
              <select className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all appearance-none`} 
                value={formData.status} onChange={e => {
                  const newStatus = e.target.value as ProjectStatus;
                  setFormData({
                    ...formData, 
                    status: newStatus,
                    progress: newStatus === 'concluido' ? 100 : formData.progress
                  });
                }}>
                <option value="em_andamento">Em Andamento</option>
                <option value="concluido">Concluído</option>
                <option value="atrasado">Atrasado (Manual)</option>
                <option value="proximo_ao_prazo">Prazo (Manual)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Estágio / Fase</label>
              <input required className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                placeholder="Ex: Iniciando, Design, Codificação..."
                value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1.5 pt-4">
            <div className="flex justify-between items-center ml-1">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Percentual de Evolução ({formData.progress}%)</label>
              {formData.progress === 100 && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={12} /> Pronto para Entrega</span>}
            </div>
            <input type="range" min="0" max="100" className="w-full h-2 bg-indigo-500/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2" 
              value={formData.progress} onChange={e => {
                const newProgress = Number(e.target.value);
                setFormData({
                  ...formData, 
                  progress: newProgress,
                  status: newProgress === 100 ? 'concluido' : formData.status === 'concluido' ? 'em_andamento' : formData.status
                });
              }} />
          </div>

          <div className="space-y-1.5">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>O que foi feito ultimamente?</label>
            <textarea className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none min-h-[80px] transition-all placeholder:opacity-20`} 
              placeholder="Descreva as últimas evoluções..."
              value={formData.lastUpdate} onChange={e => setFormData({...formData, lastUpdate: e.target.value})} />
          </div>

          <div className="space-y-4">
            <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Designar Equipe</label>
            <div className="flex flex-wrap gap-2">
              {employees.length === 0 ? (
                <p className={`text-[9px] italic ${theme === 'dark' ? 'text-white/20' : 'text-slate-400'}`}>Cadastre funcionários para designá-los a este projeto.</p>
              ) : employees.map((emp: Employee) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => toggleEmployee(emp.id)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                    formData.assignedEmployeeIds.includes(emp.id)
                      ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg'
                      : theme === 'dark' ? 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Budget Total (R$)</label>
              <input required type="number" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.totalValue} onChange={e => setFormData({...formData, totalValue: Number(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Qtd Parcelas</label>
              <input required type="number" min="1" max="60" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.installmentsCount} onChange={e => setFormData({...formData, installmentsCount: Number(e.target.value)})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Início</label>
              <input required type="date" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className={`text-[10px] font-bold uppercase tracking-[0.2em] ml-1 ${theme === 'dark' ? 'text-white/40' : 'text-slate-400'}`}>Entrega (Deadline)</label>
              <input required type="date" className={`w-full ${theme === 'dark' ? 'bg-[#050505] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'} border py-3 px-4 rounded-lg text-sm focus:border-indigo-500 outline-none transition-all`} 
                value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
            </div>
          </div>

          <div className={`${theme === 'dark' ? 'bg-white/[0.03] border-white/5' : 'bg-slate-50 border-slate-200'} p-6 rounded-xl border space-y-2`}>
             <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>Projeção Financeira</p>
             <p className={`${theme === 'dark' ? 'text-white/40' : 'text-slate-500'} text-xs leading-relaxed italic`}>
                O sistema gerará automaticamente {formData.installmentsCount} parcelas de R$ {(formData.totalValue / (formData.installmentsCount || 1)).toLocaleString()} cada, com vencimentos a cada 30 dias.
             </p>
          </div>

          <button type="submit" className={`w-full ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-lg'} py-4 rounded-lg font-bold text-xs uppercase tracking-widest mt-4 hover:opacity-90 transition-all active:scale-[0.98]`}>
            {initialData ? 'Atualizar Projeto' : 'Gerar e Confirmar Ativos'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
