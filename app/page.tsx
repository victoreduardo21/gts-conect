'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  Target, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Home, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  UserPlus, 
  Search, 
  Sun, 
  Moon, 
  User, 
  Calendar, 
  Check, 
  Building, 
  Mail, 
  Phone, 
  Percent, 
  CreditCard,
  Shield,
  HelpCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

import { 
  getClients, 
  getProjects, 
  getEmployees, 
  getLeads, 
  saveClient, 
  saveProject, 
  saveEmployee, 
  saveLead, 
  deleteEmployee, 
  deleteLead,
  saveUserProfile
} from '../lib/storage';
import { 
  Client, 
  Project, 
  Employee, 
  Lead, 
  LeadStage, 
  ProjectStatus, 
  Installment 
} from '../lib/types';

export default function NexusApp() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'projects' | 'leads' | 'employees' | 'financial' | 'settings'>('dashboard');
  
  // Auth
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true for immediate viewing
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<{name: string, email: string}>({
    name: "Administrador GTS",
    email: "admin@gtsconnect.com.br"
  });

  // Database elements
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [leadStageFilter, setLeadStageFilter] = useState<string>('all');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('all');

  // Form states and object trackers
  const [showFormModal, setShowFormModal] = useState<string | null>(null); // 'client', 'employee', 'project', 'lead'
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form fields
  const [clientForm, setClientForm] = useState({ name: '', cnpj: '', companyName: '', email: '', phone: '' });
  const [employeeForm, setEmployeeForm] = useState({ name: '', role: '', email: '', phone: '' });
  const [leadForm, setLeadForm] = useState({ name: '', company: '', email: '', phone: '', stage: 'prospeccao' as LeadStage, estimatedValue: 0, source: 'LinkedIn', notes: '' });
  const [projectForm, setProjectForm] = useState({ 
    clientId: '', 
    name: '', 
    description: '', 
    totalValue: 0, 
    status: 'em_andamento' as ProjectStatus, 
    startDate: '', 
    deadline: '', 
    stage: 'Inicial', 
    progress: 10,
    assignedEmployeeIds: [] as string[]
  });

  useEffect(() => {
    setMounted(true);
    // Theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('nexus_theme') as 'dark' | 'light';
      if (savedTheme) {
        setTheme(savedTheme);
      }
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('nexus_theme', theme);
  }, [theme]);

  // Load database items
  const reloadData = async () => {
    try {
      const c = await getClients();
      const p = await getProjects();
      const e = await getEmployees();
      const l = await getLeads();
      setClients(c);
      setProjects(p);
      setEmployees(e);
      setLeads(l);
    } catch (err) {
      console.error("Error fetching storage data:", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      reloadData();
    }
  }, [isAuthenticated]);

  // Auth operations
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Theme toggle
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Actions
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: editingItemId || `cli-${Date.now()}`,
      name: clientForm.name,
      cnpj: clientForm.cnpj,
      companyName: clientForm.companyName,
      email: clientForm.email,
      phone: clientForm.phone,
      createdAt: new Date().toISOString()
    };
    await saveClient(newClient);
    setShowFormModal(null);
    setEditingItemId(null);
    reloadData();
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const newEmp: Employee = {
      id: editingItemId || `emp-${Date.now()}`,
      name: employeeForm.name,
      role: employeeForm.role,
      email: employeeForm.email,
      phone: employeeForm.phone,
      createdAt: new Date().toISOString()
    };
    await saveEmployee(newEmp);
    setShowFormModal(null);
    setEditingItemId(null);
    reloadData();
  };

  const handleDeleteEmployeeItem = async (id: string) => {
    if (confirm("Deseja realmente remover este colaborador do sistema?")) {
      await deleteEmployee(id);
      reloadData();
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: Lead = {
      id: editingItemId || `lead-${Date.now()}`,
      name: leadForm.name,
      company: leadForm.company,
      email: leadForm.email,
      phone: leadForm.phone,
      stage: leadForm.stage,
      estimatedValue: Number(leadForm.estimatedValue),
      source: leadForm.source,
      notes: leadForm.notes,
      lastContact: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await saveLead(newLead);
    setShowFormModal(null);
    setEditingItemId(null);
    reloadData();
  };

  const handleDeleteLeadItem = async (id: string) => {
    if (confirm("Deseja realmente remover esta oportunidade do pipeline?")) {
      await deleteLead(id);
      reloadData();
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto find client name
    const client = clients.find(c => c.id === projectForm.clientId);
    const clientName = client ? client.name : 'Cliente Não Informado';

    // Installments Generation if writing new
    const installments: Installment[] = [];
    if (!editingItemId) {
      // Create 3 automatic installers split by 3 months
      const part = Number(projectForm.totalValue) / 3;
      installments.push(
        { id: `inst-${Date.now()}-1`, value: Number(part.toFixed(2)), dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pendente' },
        { id: `inst-${Date.now()}-2`, value: Number(part.toFixed(2)), dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pendente' },
        { id: `inst-${Date.now()}-3`, value: Number(part.toFixed(2)), dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pendente' }
      );
    } else {
      const existing = projects.find(p => p.id === editingItemId);
      if (existing) {
        installments.push(...existing.installments);
      }
    }

    const newProject: Project = {
      id: editingItemId || `proj-${Date.now()}`,
      clientId: projectForm.clientId,
      clientName,
      name: projectForm.name,
      description: projectForm.description,
      totalValue: Number(projectForm.totalValue),
      status: projectForm.status,
      startDate: projectForm.startDate || new Date().toISOString().split('T')[0],
      deadline: projectForm.deadline,
      stage: projectForm.stage,
      progress: Number(projectForm.progress),
      assignedEmployeeIds: projectForm.assignedEmployeeIds,
      installments
    };

    await saveProject(newProject);
    setShowFormModal(null);
    setEditingItemId(null);
    reloadData();
  };

  // Installment modification helpers
  const handleToggleInstallmentStatus = async (projectId: string, installmentId: string) => {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;
    
    const updatedInstallments = proj.installments.map(inst => {
      if (inst.id === installmentId) {
        const nextStatus: 'pendente' | 'pago' | 'atrasado' = inst.status === 'pago' ? 'pendente' : 'pago';
        return { ...inst, status: nextStatus };
      }
      return inst;
    });

    const updatedProj = { ...proj, installments: updatedInstallments };
    await saveProject(updatedProj);
    reloadData();
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch(status) {
      case 'em_andamento': return { text: 'Em Andamento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' };
      case 'atrasado': return { text: 'Atrasado', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' };
      case 'proximo_ao_prazo': return { text: 'Crítico', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' };
      case 'concluido': return { text: 'Concluído', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
    }
  };

  const getLeadStageLabel = (stage: LeadStage) => {
    switch(stage) {
      case 'prospeccao': return { text: 'Prospecção', color: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300' };
      case 'contato': return { text: 'Contato Estabelecido', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' };
      case 'proposta': return { text: 'Proposta Enviada', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' };
      case 'negociacao': return { text: 'Negociação', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' };
      case 'ganho': return { text: 'Ganho (Fechado)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' };
      case 'perdido': return { text: 'Perdido', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400' };
    }
  };

  // Auto computations
  const totalValueProjectsAndLeads = projects.reduce((total, p) => total + p.totalValue, 0);
  const activeProjectsCount = projects.filter(p => p.status === 'em_andamento').length;
  const totalLeadsCount = leads.length;
  const activeClientsCount = clients.length;

  const realizedBilling = projects.reduce((sum, p) => {
    const paid = p.installments.filter(i => i.status === 'pago').reduce((acc, i) => acc + i.value, 0);
    return sum + paid;
  }, 0);

  const pendingBilling = projects.reduce((sum, p) => {
    const pending = p.installments.filter(i => i.status === 'pendente' || i.status === 'atrasado').reduce((acc, i) => acc + i.value, 0);
    return sum + pending;
  }, 0);

  // Recharts Monthly billing simulation chart data
  const chartData = [
    { name: 'Jan', Realizado: realizedBilling * 0.12, Previsto: totalValueProjectsAndLeads * 0.08 + realizedBilling * 0.10 },
    { name: 'Fev', Realizado: realizedBilling * 0.28, Previsto: totalValueProjectsAndLeads * 0.12 + realizedBilling * 0.25 },
    { name: 'Mar', Realizado: realizedBilling * 0.45, Previsto: totalValueProjectsAndLeads * 0.20 + realizedBilling * 0.40 },
    { name: 'Abr', Realizado: realizedBilling * 0.60, Previsto: totalValueProjectsAndLeads * 0.35 + realizedBilling * 0.55 },
    { name: 'Mai', Realizado: realizedBilling * 0.85, Previsto: totalValueProjectsAndLeads * 0.50 + realizedBilling * 0.80 },
    { name: 'Jun', Realizado: realizedBilling, Previsto: totalValueProjectsAndLeads * 0.70 + pendingBilling * 0.90 },
  ];

  const leadsPipelineData = [
    { name: 'Prospecção', value: leads.filter(l => l.stage === 'prospeccao').length },
    { name: 'Contato', value: leads.filter(l => l.stage === 'contato').length },
    { name: 'Proposta', value: leads.filter(l => l.stage === 'proposta').length },
    { name: 'Negociação', value: leads.filter(l => l.stage === 'negociacao').length },
    { name: 'Ganho', value: leads.filter(l => l.stage === 'ganho').length },
    { name: 'Perdido', value: leads.filter(l => l.stage === 'perdido').length },
  ];

  const COLORS = ['#94a3b8', '#06b6d4', '#6366f1', '#a855f7', '#10b981', '#f43f5e'];

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white p-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="w-full max-w-md space-y-8 bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight font-serif text-sky-400">GTS Conect</h2>
            <p className="text-sm text-slate-400">Nexus Business Manager</p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">E-mail Corporativo</label>
                <input 
                  type="email" 
                  value={user.email} 
                  onChange={e => setUser({ ...user, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="seu_nome@gtsconnect.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Senha de Acesso</label>
                <input 
                  type="password" 
                  defaultValue="••••••••" 
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500" 
                  placeholder="Digite sua senha"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3 rounded-lg bg-sky-500 hover:bg-sky-600 transition font-semibold text-sm cursor-pointer shadow-lg shadow-sky-500/20"
            >
              Entrar no GTS Conect
            </button>
          </form>
          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">Acesso simulado offline ativo com backup criptografado local</span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden text-slate-900 dark:text-slate-100 dark:bg-slate-950">
      
      {/* Sidebar navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 flex-shrink-0 z-20">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight font-serif text-sky-400">GTS Conect</span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">Nexus Manager</span>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
            title="Mudar visual"
            id="theme-toggler-btn"
          >
            {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Estatísticas', icon: Home },
            { id: 'clients', label: 'Clientes Ativos', icon: Building },
            { id: 'projects', label: 'Projetos integrados', icon: Briefcase },
            { id: 'leads', label: 'Oportunidades (CRM)', icon: Target },
            { id: 'employees', label: 'Colaboradores', icon: Users },
            { id: 'financial', label: 'Faturamento', icon: DollarSign },
            { id: 'settings', label: 'Configurações', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as any); setSearchQuery(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition cursor-pointer ${
                  activeTab === item.id 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center font-bold text-sky-400 border border-slate-700">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate">{user.name}</span>
              <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-rose-950/20 hover:border-rose-900/30 hover:text-rose-400 transition text-slate-400 text-xs font-semibold cursor-pointer"
            id="sidebar-logout-btn"
          >
            <LogOut size={14} />
            <span>Sair do sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Container Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 dark:bg-slate-950">
        
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-900 px-8 flex items-center justify-between bg-white dark:bg-slate-900/40 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-serif font-semibold tracking-tight text-slate-900 dark:text-white">
              {activeTab === 'dashboard' && 'Dashboard de Performance'}
              {activeTab === 'clients' && 'Gestão de Clientes'}
              {activeTab === 'projects' && 'Acompanhamento de Projetos'}
              {activeTab === 'leads' && 'Pipeline de Vendas'}
              {activeTab === 'employees' && 'Equipe e Alocações'}
              {activeTab === 'financial' && 'Visão Financeira'}
              {activeTab === 'settings' && 'Instalações e Configurações'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-80">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar registros..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 pl-9 pr-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>

            {/* Quick Record Action Trigger */}
            {activeTab !== 'dashboard' && activeTab !== 'financial' && activeTab !== 'settings' && (
              <button 
                onClick={() => {
                  setEditingItemId(null);
                  if (activeTab === 'clients') {
                    setClientForm({ name: '', cnpj: '', companyName: '', email: '', phone: '' });
                    setShowFormModal('client');
                  } else if (activeTab === 'employees') {
                    setEmployeeForm({ name: '', role: '', email: '', phone: '' });
                    setShowFormModal('employee');
                  } else if (activeTab === 'leads') {
                    setLeadForm({ name: '', company: '', email: '', phone: '', stage: 'prospeccao', estimatedValue: 0, source: 'LinkedIn', notes: '' });
                    setShowFormModal('lead');
                  } else if (activeTab === 'projects') {
                    setProjectForm({ clientId: '', name: '', description: '', totalValue: 0, status: 'em_andamento', startDate: '', deadline: '', stage: 'Planejamento', progress: 5, assignedEmployeeIds: [] });
                    setShowFormModal('project');
                  }
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 transition text-xs font-semibold text-white shadow-md shadow-sky-500/15 cursor-pointer"
                id="header-create-record-btn"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Pages Render */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6 flex-1">
          
          {/* TAB 1: DASHBOARD METRICS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Statistic Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-sky-50 dark:bg-sky-950/40 rounded-xl text-sky-500">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Previsão Contratada</span>
                    <span className="text-xl font-bold font-serif tracking-tight">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalValueProjectsAndLeads)}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-500">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Projetos Ativos</span>
                    <span className="text-2xl font-bold font-serif tracking-tight">{activeProjectsCount}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-500">
                    <Users size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Clientes em Carteira</span>
                    <span className="text-2xl font-bold font-serif tracking-tight">{activeClientsCount}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-500">
                    <Target size={24} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Oportunidades Ativas</span>
                    <span className="text-2xl font-bold font-serif tracking-tight">{totalLeadsCount}</span>
                  </div>
                </div>

              </div>

              {/* Graphical Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Billing Area Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-slate-400">Previsão e Fluxo de Caixa</h3>
                    <p className="text-xs text-slate-500">Comparação Semestral entre faturamento realizado e previsto (R$)</p>
                  </div>
                  <div className="h-[280px] w-full">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.1} />
                          <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `R$${value/1000}k`} tickLine={false} />
                          <Tooltip formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`]} />
                          <Area type="monotone" dataKey="Realizado" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorRealizado)" />
                          <Area type="monotone" dataKey="Previsto" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPrevisto)" strokeDasharray="4 4" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-xs">Carregando gráficos...</div>
                    )}
                  </div>
                </div>

                {/* Pipeline Stats Pie Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold uppercase text-slate-400">Pipeline de Vendas</h3>
                    <p className="text-xs text-slate-500">Distribuição por estágio do funil comercial</p>
                  </div>
                  <div className="h-[200px] w-full flex items-center justify-center relative">
                    {mounted ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={leadsPipelineData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {leadsPipelineData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-slate-400 text-xs">Carregando...</div>
                    )}
                    <div className="absolute text-center">
                      <span className="text-3xl font-bold font-serif">{totalLeadsCount}</span>
                      <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Negócios</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-2">
                    {leadsPipelineData.map((item, index) => (
                      <div key={item.name} className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: COLORS[index] }}></span>
                        <span className="text-slate-500 dark:text-slate-400 truncate">{item.name}:</span>
                        <span className="font-bold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Critical Project Risks & Financial Milestones */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Active Deliveries tracker list */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-slate-400 font-sans">Status das Entregas</h3>
                      <p className="text-xs text-slate-500">Próximos deadlines críticos de desenvolvimento</p>
                    </div>
                    <Briefcase size={16} className="text-slate-400" />
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-xs">Nenhum projeto cadastrado no sistema.</div>
                    ) : (
                      projects.slice(0, 4).map(p => {
                        const style = getStatusLabel(p.status);
                        const daysLeft = Math.ceil((new Date(p.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                        return (
                          <div key={p.id} className="py-3.5 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <span className="text-xs font-bold truncate block">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block">{p.clientName} • Estágio: {p.stage}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block">Prazo</span>
                                <span className={`text-[11px] font-semibold ${daysLeft < 15 ? 'text-rose-500 font-bold' : ''}`}>
                                  {daysLeft > 0 ? `${daysLeft} dias restando` : 'Prazo esgotado'}
                                </span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0 ${style.color}`}>
                                {style.text}
                              </span>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Next Incoming Installments */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold uppercase text-slate-400">Últimos Lançamentos Financeiros</h3>
                      <p className="text-xs text-slate-500">Próximas parcelas a receber dos clientes ativos</p>
                    </div>
                    <CreditCard size={16} className="text-slate-400" />
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(() => {
                      const list: { projName: string, inst: Installment, id: string }[] = [];
                      projects.forEach(p => {
                        p.installments.forEach(i => {
                          list.push({ projName: p.name, inst: i, id: `${p.id}-${i.id}` });
                        });
                      });
                      const pending = list.filter(item => item.inst.status === 'pendente').slice(0, 4);
                      
                      return pending.length === 0 ? (
                        <div className="py-4 text-center text-slate-400 text-xs">Sem parcelas pendentes para receber.</div>
                      ) : (
                        pending.map(item => (
                          <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                            <div>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">{item.projName}</span>
                              <span className="text-[10px] text-slate-400">Vence em: {item.inst.dueDate}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-black font-mono block">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.inst.value)}</span>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 uppercase font-black tracking-wider inline-block mt-0.5">A receber</span>
                            </div>
                          </div>
                        ))
                      );
                    })()}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CLIENTS VIEW */}
          {activeTab === 'clients' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Clientes Ativos</span>
                  <span className="text-[11px] text-slate-500 font-medium">{clients.length} corporações cadastradas</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {clients.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      <Building size={32} className="mx-auto mb-2 opacity-50" />
                       nenhum cliente cadastrado no sistema. Clique em Adicionar acima para inserir.
                    </div>
                  ) : (
                    clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.companyName.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                      <div key={c.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-100/10 transition">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-500">
                              <Building size={16} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold">{c.name}</h3>
                              <span className="text-[11px] text-slate-400 block font-mono">CNPJ: {c.cnpj}</span>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 block pl-10">Razão Social: <span className="font-semibold text-slate-700 dark:text-slate-300">{c.companyName}</span></span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 pl-10 md:pl-0">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Mail size={12} />
                              <span className="truncate max-w-[180px] block">{c.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Phone size={12} />
                              <span>{c.phone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setClientForm({ name: c.name, cnpj: c.cnpj, companyName: c.companyName, email: c.email, phone: c.phone });
                                setEditingItemId(c.id);
                                setShowFormModal('client');
                              }}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 transition text-slate-500"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS VIEW */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase">Filtrar Status:</span>
                {['all', 'em_andamento', 'proximo_ao_prazo', 'atrasado', 'concluido'].map(st => (
                  <button
                    key={st}
                    onClick={() => setProjectStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      projectStatusFilter === st 
                        ? 'bg-sky-500 text-white' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {st === 'all' && 'Todos'}
                    {st === 'em_andamento' && 'Em Andamento'}
                    {st === 'proximo_ao_prazo' && 'Críticos'}
                    {st === 'atrasado' && 'Atrasado'}
                    {st === 'concluido' && 'Concluído'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.length === 0 ? (
                  <div className="md:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-900 text-center text-slate-400">
                    <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                    Nenhum projeto registrado no sistema. Adicione novos projetos para iniciar o acompanhamento.
                  </div>
                ) : (
                  projects
                    .filter(p => projectStatusFilter === 'all' || p.status === projectStatusFilter)
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(p => {
                      const style = getStatusLabel(p.status);
                      const totalPaid = p.installments.filter(i => i.status === 'pago').reduce((sum, item) => sum + item.value, 0);
                      const daysTotal = Math.ceil((new Date(p.deadline).getTime() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
                      const daysPassed = Math.ceil((Date.now() - new Date(p.startDate).getTime()) / (1000 * 60 * 60 * 24));
                      const timeProgress = daysTotal > 0 ? Math.min(100, Math.max(0, (daysPassed / daysTotal) * 100)) : 100;
                      
                      return (
                        <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 hover:border-slate-300 dark:hover:border-slate-800 transition">
                          <div className="space-y-4">
                            
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">{p.clientName}</span>
                                <h3 className="text-base font-bold truncate text-slate-900 dark:text-white mt-1">{p.name}</h3>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider block shrink-0 ${style.color}`}>
                                {style.text}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>

                            {/* Task Progress sliders */}
                            <div className="space-y-3">
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                                  <span>Progresso do Projeto:</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200">{p.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-sky-500 h-full rounded-full" style={{ width: `${p.progress}%` }}></div>
                                </div>
                              </div>

                              <div>
                                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                                  <span>Tempo de Contrato:</span>
                                  <span>{daysPassed > 0 ? `${daysPassed} dias passados` : 'Início imediato'}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${timeProgress}%` }}></div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Current Action / Update log state */}
                            {p.lastUpdate && (
                              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 text-[11px] text-slate-500 border border-slate-100 dark:border-slate-800 flex gap-2 items-start max-h-24 overflow-y-auto">
                                <Clock size={12} className="shrink-0 text-sky-500 mt-0.5" />
                                <div>
                                  <strong className="text-slate-700 dark:text-slate-300">Último andamento:</strong> {p.lastUpdate}
                                </div>
                              </div>
                            )}

                            {/* Collaborator assignment indicators */}
                            <div className="flex justify-between items-center text-xs pt-2">
                              <span className="text-slate-400 font-medium block">Integrantes GTS:</span>
                              <div className="flex items-center -space-x-1.5 overflow-hidden">
                                {p.assignedEmployeeIds && p.assignedEmployeeIds.map(empId => {
                                  const c = employees.find(e => e.id === empId);
                                  return c ? (
                                    <div 
                                      key={empId} 
                                      className="w-6 h-6 rounded-full bg-sky-500 text-white shrink-0 font-bold border border-white dark:border-slate-900 text-[10px] flex items-center justify-center"
                                      title={`${c.name} (${c.role})`}
                                    >
                                      {c.name.charAt(0)}
                                    </div>
                                  ) : null;
                                })}
                                {(!p.assignedEmployeeIds || p.assignedEmployeeIds.length === 0) && (
                                  <span className="text-slate-500 text-[10px]">Nenhum</span>
                                )}
                              </div>
                            </div>

                            {/* Billing & Installment Control tracker accordion */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Faturamento total</span>
                                  <strong className="text-sm font-black font-semibold text-sky-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.totalValue)}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Recebido</span>
                                  <strong className="text-sm font-bold text-emerald-500">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPaid)}</strong>
                                </div>
                              </div>
                              
                              <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Parcelas de Recebimento:</span>
                                {p.installments && p.installments.map((inst, index) => (
                                  <div key={inst.id} className="flex items-center justify-between text-xs py-1.5 bg-white dark:bg-slate-900/80 px-2.5 rounded-lg border border-slate-100 dark:border-slate-800 flex-wrap gap-2">
                                    <span className="font-semibold text-slate-500">{index + 1}ª Parcela ({inst.dueDate.split('-').reverse().join('/')})</span>
                                    <div className="flex items-center gap-3">
                                      <span className="font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(inst.value)}</span>
                                      <button 
                                        onClick={() => handleToggleInstallmentStatus(p.id, inst.id)}
                                        className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase transition cursor-pointer ${
                                          inst.status === 'pago' 
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                                            : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                        }`}
                                      >
                                        {inst.status === 'pago' ? 'Pago' : 'Pagar'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400">Entrega: {p.deadline.split('-').reverse().join('/')}</span>
                            <div className="flex items-center gap-2">
                              {/* Quick status progress boost */}
                              <button 
                                onClick={async () => {
                                  const currentVal = p.progress;
                                  const updatedProgress = Math.min(100, currentVal + 10);
                                  const updatedStatus = updatedProgress === 100 ? 'concluido' as ProjectStatus : p.status;
                                  await saveProject({ 
                                    ...p, 
                                    progress: updatedProgress, 
                                    status: updatedStatus,
                                    lastUpdate: `Avanço de progresso para ${updatedProgress}% em ${new Date().toLocaleDateString('pt-BR')}`
                                  });
                                  reloadData();
                                }}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-sky-500 hover:bg-sky-500 hover:text-white hover:border-transparent transition"
                                title="Add 10% progress"
                              >
                                +10%
                              </button>
                              
                              <button 
                                onClick={() => {
                                  setProjectForm({
                                    clientId: p.clientId,
                                    name: p.name,
                                    description: p.description,
                                    totalValue: p.totalValue,
                                    status: p.status,
                                    startDate: p.startDate,
                                    deadline: p.deadline,
                                    stage: p.stage,
                                    progress: p.progress,
                                    assignedEmployeeIds: p.assignedEmployeeIds || []
                                  });
                                  setEditingItemId(p.id);
                                  setShowFormModal('project');
                                }}
                                className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 transition text-slate-500"
                                title="Editar"
                              >
                                <Edit size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })
                )}
              </div>

            </div>
          )}

          {/* TAB 4: LEADS PIPELINE */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase">Filtrar Estágio:</span>
                {['all', 'prospeccao', 'contato', 'proposta', 'negociacao', 'ganho', 'perdido'].map(st => (
                  <button
                    key={st}
                    onClick={() => setLeadStageFilter(st)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    {st === 'all' && 'Todos'}
                    {st === 'prospeccao' && 'Prospecção'}
                    {st === 'contato' && 'Contato'}
                    {st === 'proposta' && 'Proposta'}
                    {st === 'negociacao' && 'Negociação'}
                    {st === 'ganho' && 'Ganho'}
                    {st === 'perdido' && 'Perdido'}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-900 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400"> Pipeline de Oportunidades</span>
                  <span className="text-[11px] text-slate-500">{leads.length} leads qualificados</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {leads.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      <Target size={32} className="mx-auto mb-2 opacity-50" />
                      Nenhuma oportunidade cadastrada no funil de vendas.
                    </div>
                  ) : (
                    leads
                      .filter(l => leadStageFilter === 'all' || l.stage === leadStageFilter)
                      .filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.company.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(l => {
                        const style = getLeadStageLabel(l.stage);
                        return (
                          <div key={l.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-100/10 transition">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{l.name}</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${style.color}`}>
                                  {style.text}
                                </span>
                              </div>
                              <span className="text-xs text-slate-500 block">Empresa: <strong className="text-slate-700 dark:text-slate-300">{l.company}</strong> | Origem: <span className="font-semibold">{l.source}</span></span>
                              <p className="text-[11px] text-slate-400 max-w-xl pl-1">{l.notes}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 grow justify-end">
                              <div className="text-left sm:text-right">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Valor Estimado:</span>
                                <strong className="text-sm font-black font-semibold text-sky-500 font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(l.estimatedValue)}</strong>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Quick transition action */}
                                {l.stage !== 'ganho' && l.stage !== 'perdido' && (
                                  <button 
                                    onClick={async () => {
                                      let nextS: LeadStage = 'ganho';
                                      if (l.stage === 'prospeccao') nextS = 'contato';
                                      else if (l.stage === 'contato') nextS = 'proposta';
                                      else if (l.stage === 'proposta') nextS = 'negociacao';
                                      else if (l.stage === 'negociacao') nextS = 'ganho';
                                      
                                      await saveLead({ ...l, stage: nextS });
                                      reloadData();
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold text-sky-500 hover:bg-sky-500 hover:text-white hover:border-transparent transition"
                                    title="Avançar funil comercial"
                                  >
                                    Avançar
                                  </button>
                                )}

                                <button 
                                  onClick={() => {
                                    setLeadForm({
                                      name: l.name,
                                      company: l.company,
                                      email: l.email,
                                      phone: l.phone,
                                      stage: l.stage,
                                      estimatedValue: l.estimatedValue,
                                      source: l.source,
                                      notes: l.notes
                                    });
                                    setEditingItemId(l.id);
                                    setShowFormModal('lead');
                                  }}
                                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 transition text-slate-500"
                                  title="Editar"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteLeadItem(l.id)}
                                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 transition text-slate-500"
                                  title="Remover"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: EMPLOYEES VIEW */}
          {activeTab === 'employees' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">Colaboradores Operacionais</span>
                  <span className="text-[11px] text-slate-500">{employees.length} colaboradores na equipe</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {employees.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 text-sm">
                      <Users size={32} className="mx-auto mb-2 opacity-50" />
                      Nenhum colaborador cadastrado.
                    </div>
                  ) : (
                    employees.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.role.toLowerCase().includes(searchQuery.toLowerCase())).map(e => (
                      <div key={e.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-100/10 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center font-bold text-sm shrink-0">
                            {e.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{e.name}</h3>
                            <span className="text-xs text-slate-400 block">{e.role}</span>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 md:grow justify-end pl-12 md:pl-0">
                          <div className="space-y-1 text-xs text-slate-400 text-left sm:text-right">
                            <span className="block">{e.email}</span>
                            <span className="block">{e.phone}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEmployeeForm({ name: e.name, role: e.role, email: e.email, phone: e.phone });
                                setEditingItemId(e.id);
                                setShowFormModal('employee');
                              }}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500/10 hover:text-sky-500 transition text-slate-500"
                              title="Editar"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployeeItem(e.id)}
                              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-500/10 hover:text-rose-500 transition text-slate-500"
                              title="Remover"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FINANCIAL REPORT */}
          {activeTab === 'financial' && (
            <div className="space-y-8 animate-fade-in">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm">
                  <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Faturamento Total Contratado</span>
                  <p className="text-2xl font-black font-serif tracking-tight mt-2 text-sky-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValueProjectsAndLeads)}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Soma de contratos e valores estimados de leads ativos</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm">
                  <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Total Realizado (Recebido)</span>
                  <p className="text-2xl font-black font-serif tracking-tight mt-2 text-emerald-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(realizedBilling)}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Total de parcelas pagas pelos clientes</span>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-900 shadow-sm">
                  <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">A Receber Próximos Meses</span>
                  <p className="text-2xl font-black font-serif tracking-tight mt-2 text-amber-500">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingBilling)}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Total de parcelas sob acompanhamento contratual</span>
                </div>

              </div>

              {/* Installments tracker table - Master list */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight uppercase text-slate-400">Conciliação de Parcelas por Projeto</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Clique em Pagar/Pendente para registrar os fluxos de entradas de capital</p>
                  </div>
                  <DollarSign size={16} className="text-slate-400" />
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
                    <thead className="bg-slate-50 dark:bg-slate-900/60 uppercase text-[10px] text-slate-400 tracking-wider">
                      <tr>
                        <th className="p-4 pl-6">Projeto</th>
                        <th className="p-4">Cliente</th>
                        <th className="p-4">Vencimento</th>
                        <th className="p-4 text-right">Valor Parcela</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(() => {
                        const allInstallments: { projId: string, projName: string, clientName: string, inst: Installment }[] = [];
                        projects.forEach(p => {
                          const associatedClient = clients.find(c => c.id === p.clientId);
                          const cleanCliName = associatedClient ? associatedClient.name : p.clientName;
                          p.installments.forEach(inst => {
                            allInstallments.push({
                              projId: p.id,
                              projName: p.name,
                              clientName: cleanCliName,
                              inst
                            });
                          });
                        });

                        return allInstallments.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400">Nenhuma parcela registrada ou faturamento contratado encontrado.</td>
                          </tr>
                        ) : (
                          allInstallments.map(item => (
                            <tr key={`${item.projId}-${item.inst.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition">
                              <td className="p-4 pl-6 font-bold">{item.projName}</td>
                              <td className="p-4 text-slate-400">{item.clientName}</td>
                              <td className="p-4">{item.inst.dueDate.split('-').reverse().join('/')}</td>
                              <td className="p-4 text-right font-mono font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.inst.value)}</td>
                              <td className="p-4 flex items-center justify-center">
                                <button
                                  onClick={() => handleToggleInstallmentStatus(item.projId, item.inst.id)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition cursor-pointer ${
                                    item.inst.status === 'pago'
                                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                                      : 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                                  }`}
                                >
                                  {item.inst.status === 'pago' ? 'Pago' : 'Pendente'}
                                </button>
                              </td>
                            </tr>
                          ))
                        );
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: SETTINGS & CREDENTIALS INFO */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-3xl animate-fade-in">
              
              {/* Profile Config */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Perfil e Credenciais GTS</h3>
                  <p className="text-xs text-slate-500 mt-1">Configurações de identidade corporativa e perfis operacionais</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">Nome do Gestor</label>
                    <input 
                      type="text" 
                      value={user.name} 
                      onChange={e => {
                        const nextN = e.target.value;
                        setUser(prev => ({ ...prev, name: nextN }));
                        saveUserProfile({ name: nextN, email: user.email });
                      }}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase text-slate-400 block mb-1">E-mail Administrativo</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      onChange={e => {
                        const nextE = e.target.value;
                        setUser(prev => ({ ...prev, email: nextE }));
                        saveUserProfile({ name: user.name, email: nextE });
                      }}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* System Credentials summary info */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex gap-3 items-center">
                  <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl">
                    <Database size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Conexão Cloud Database</h3>
                    <p className="text-xs text-slate-500 mt-1">Sincronização de Cloud Firestore em tempo real ativa</p>
                  </div>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/80 space-y-3 font-mono text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Provedor:</span>
                    <strong className="text-slate-800 dark:text-slate-200">Google Firebase (Firestore)</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Instância do Banco ID:</span>
                    <strong className="text-slate-800 dark:text-slate-200">ai-studio-669a1af9-89cc-4885-9a82-3a9ac9fa1c62</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Backup Integrado:</span>
                    <strong className="text-emerald-500 flex items-center gap-1">● Ativo (Local Backup Fallback)</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      if (confirm("Isto apagará os dados customizados salvos no localStorage, voltando aos valores mocks padrão. Continuar?")) {
                        localStorage.removeItem('nexus_clients');
                        localStorage.removeItem('nexus_projects');
                        localStorage.removeItem('nexus_employees');
                        localStorage.removeItem('nexus_leads');
                        alert("Banco de dados resetado com sucesso!");
                        reloadData();
                      }
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/25 hover:bg-rose-500 hover:text-white hover:border-transparent transition cursor-pointer"
                  >
                    Resetar Banco de Dados Local
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </main>

      {/* FORM MODALS OVERLAY */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 min-w-[320px] sm:min-w-[480px] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg font-bold font-serif border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                {editingItemId ? 'Editar Registro' : 'Novo Registro'} - {showFormModal === 'client' && 'Cliente'}
                {showFormModal === 'employee' && 'Colaborador'}
                {showFormModal === 'lead' && 'Oportunidade (Funil)'}
                {showFormModal === 'project' && 'Projeto'}
              </h2>

              {/* CLIENT FORM */}
              {showFormModal === 'client' && (
                <form onSubmit={handleSaveClient} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Nome do Cliente (Apelido)</label>
                    <input 
                      type="text" 
                      value={clientForm.name} 
                      onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                      placeholder="Ex: GTS Telecom"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">CNPJ</label>
                    <input 
                      type="text" 
                      value={clientForm.cnpj} 
                      onChange={e => setClientForm({ ...clientForm, cnpj: e.target.value })}
                      placeholder="Ex: 12.345.678/0001-90"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Razão Social Completa</label>
                    <input 
                      type="text" 
                      value={clientForm.companyName} 
                      onChange={e => setClientForm({ ...clientForm, companyName: e.target.value })}
                      placeholder="Ex: GTS Telecomunicações LTDA"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">E-mail Comercial</label>
                      <input 
                        type="email" 
                        value={clientForm.email} 
                        onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                        placeholder="contato@empresa.com"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Telefone / Whats</label>
                      <input 
                        type="text" 
                        value={clientForm.phone} 
                        onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <button type="button" onClick={() => setShowFormModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition">Salvar Cliente</button>
                  </div>
                </form>
              )}

              {/* EMPLOYEE FORM */}
              {showFormModal === 'employee' && (
                <form onSubmit={handleSaveEmployee} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      value={employeeForm.name} 
                      onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                      placeholder="Ex: Carlos Augusto Silva"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Cargo / Função</label>
                    <input 
                      type="text" 
                      value={employeeForm.role} 
                      onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value })}
                      placeholder="Ex: Desenvolvedor Full Stack"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">E-mail Corporativo</label>
                      <input 
                        type="email" 
                        value={employeeForm.email} 
                        onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                        placeholder="nome@gtsconect.com"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Telefone Contato</label>
                      <input 
                        type="text" 
                        value={employeeForm.phone} 
                        onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <button type="button" onClick={() => setShowFormModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition">Salvar Colaborador</button>
                  </div>
                </form>
              )}

              {/* LEAD FORM */}
              {showFormModal === 'lead' && (
                <form onSubmit={handleSaveLead} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Nome do Contato</label>
                      <input 
                        type="text" 
                        value={leadForm.name} 
                        onChange={e => setLeadForm({ ...leadForm, name: e.target.value })}
                        placeholder="Ex: Pedro Alvares"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Empresa</label>
                      <input 
                        type="text" 
                        value={leadForm.company} 
                        onChange={e => setLeadForm({ ...leadForm, company: e.target.value })}
                        placeholder="Ex: Alpha Corp"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={leadForm.email} 
                        onChange={e => setLeadForm({ ...leadForm, email: e.target.value })}
                        placeholder="contato@empresa.com"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Telefone</label>
                      <input 
                        type="text" 
                        value={leadForm.phone} 
                        onChange={e => setLeadForm({ ...leadForm, phone: e.target.value })}
                        placeholder="(11) 98888-8888"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Estágio Comercial</label>
                      <select 
                        value={leadForm.stage} 
                        onChange={e => setLeadForm({ ...leadForm, stage: e.target.value as LeadStage })}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="prospeccao">Prospecção</option>
                        <option value="contato">Contato Estabelecido</option>
                        <option value="proposta">Proposta Enviada</option>
                        <option value="negociacao">Negociação</option>
                        <option value="ganho">Ganho (Fechado)</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Valor Estimado do Contrato</label>
                      <input 
                        type="number" 
                        value={leadForm.estimatedValue} 
                        onChange={e => setLeadForm({ ...leadForm, estimatedValue: Number(e.target.value) })}
                        placeholder="R$ 50000"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Origem do Lead</label>
                    <input 
                      type="text" 
                      value={leadForm.source} 
                      onChange={e => setLeadForm({ ...leadForm, source: e.target.value })}
                      placeholder="Ex: LinkedIn, Indicação, Evento, Ads"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Notas Comerciais d Contato</label>
                    <textarea 
                      value={leadForm.notes} 
                      onChange={e => setLeadForm({ ...leadForm, notes: e.target.value })}
                      placeholder="Discussões sobre o projeto, expectativas de prazo..."
                      rows={3}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                    <button type="button" onClick={() => setShowFormModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition">Salvar Oportunidade</button>
                  </div>
                </form>
              )}

              {/* PROJECT FORM */}
              {showFormModal === 'project' && (
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Cliente Vinculado</label>
                    <select 
                      value={projectForm.clientId} 
                      onChange={e => setProjectForm({ ...projectForm, clientId: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    >
                      <option value="">Selecione o cliente...</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Nome do Projeto</label>
                    <input 
                      type="text" 
                      value={projectForm.name} 
                      onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                      placeholder="Ex: Portal de Atendimento"
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Escopo / Descrição</label>
                    <textarea 
                      value={projectForm.description} 
                      onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                      placeholder="Descreva o escopo acordado e entregáveis..."
                      rows={2}
                      className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Valor do Contrato</label>
                      <input 
                        type="number" 
                        value={projectForm.totalValue} 
                        onChange={e => setProjectForm({ ...projectForm, totalValue: Number(e.target.value) })}
                        placeholder="R$ 48000"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Status Operacional</label>
                      <select 
                        value={projectForm.status} 
                        onChange={e => setProjectForm({ ...projectForm, status: e.target.value as ProjectStatus })}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="em_andamento">Em Andamento</option>
                        <option value="atrasado">Atrasado</option>
                        <option value="proximo_ao_prazo">Crítico</option>
                        <option value="concluido">Concluído</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Data Início</label>
                      <input 
                        type="date" 
                        value={projectForm.startDate} 
                        onChange={e => setProjectForm({ ...projectForm, startDate: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Prazo Final Entrega</label>
                      <input 
                        type="date" 
                        value={projectForm.deadline} 
                        onChange={e => setProjectForm({ ...projectForm, deadline: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Estágio Atual</label>
                      <input 
                        type="text" 
                        value={projectForm.stage} 
                        onChange={e => setProjectForm({ ...projectForm, stage: e.target.value })}
                        placeholder="Ex: Layout UI/UX, Backend dev"
                        className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Progresso % ({projectForm.progress}%)</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={projectForm.progress} 
                        onChange={e => setProjectForm({ ...projectForm, progress: Number(e.target.value) })}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer mt-4"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase font-semibold text-slate-400 block mb-1">Alocar Colaboradores GTS</label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 rounded-xl">
                      {employees.map(emp => {
                        const isAssigned = projectForm.assignedEmployeeIds.includes(emp.id);
                        return (
                          <label key={emp.id} className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={isAssigned}
                              onChange={() => {
                                let list = [...projectForm.assignedEmployeeIds];
                                if (isAssigned) list = list.filter(id => id !== emp.id);
                                else list.push(emp.id);
                                setProjectForm({ ...projectForm, assignedEmployeeIds: list });
                              }}
                              className="rounded border-slate-300 text-sky-500 focus:ring-sky-500 w-4 h-4 shrink-0"
                            />
                            <span className="truncate">{emp.name}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6 font-sans">
                    <button type="button" onClick={() => setShowFormModal(null)} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
                    <button type="submit" className="px-4 py-2.5 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-600 transition">Salvar Projeto</button>
                  </div>
                </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
