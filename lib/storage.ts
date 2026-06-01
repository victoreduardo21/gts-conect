import { db, auth, useFirebase, collection, doc, getDocs, setDoc, deleteDoc } from './firebase';
import { Client, Project, Employee, Lead, ProjectStatus, LeadStage, Installment } from './types';

// Constants for local keys
const CLIENTS_KEY = 'nexus_clients';
const PROJECTS_KEY = 'nexus_projects';
const EMPLOYEES_KEY = 'nexus_employees';
const LEADS_KEY = 'nexus_leads';

// Initial Seeding Mock Data
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'GTS Telecom',
    cnpj: '12.345.678/0001-90',
    companyName: 'GTS Telecomunicações Ltda',
    email: 'compras@gtstelecom.com.br',
    phone: '(11) 98765-1122',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cli-2',
    name: 'Nexus Tecnologia',
    cnpj: '98.765.432/0001-10',
    companyName: 'Nexus Tech Soluções Integradas',
    email: 'financeiro@nexustech.io',
    phone: '(21) 97654-3344',
    createdAt: new Date().toISOString()
  },
  {
    id: 'cli-3',
    name: 'Inova Logística',
    cnpj: '45.892.112/0001-05',
    companyName: 'Inova Transportes e Logística S/A',
    email: 'diretoria@inovalog.com.br',
    phone: '(47) 96543-5566',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Carlos Silva',
    role: 'Gerente de Projetos',
    email: 'carlos.silva@nexus.com.br',
    phone: '(11) 98765-4321',
    createdAt: new Date().toISOString()
  },
  {
    id: 'emp-2',
    name: 'Mariana Costa',
    role: 'Desenvolvedora Full Stack',
    email: 'mariana.c@nexus.com.br',
    phone: '(11) 97654-3210',
    createdAt: new Date().toISOString()
  },
  {
    id: 'emp-3',
    name: 'Bruno Ramos',
    role: 'Designer UI/UX',
    email: 'bruno.r@nexus.com.br',
    phone: '(11) 96543-2109',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    name: 'Alpha Alimentos',
    company: 'Alpha Distribuidora S.A',
    email: 'comercial@alphaalimentos.com',
    phone: '(11) 91234-5678',
    stage: 'proposta',
    estimatedValue: 35000,
    source: 'LinkedIn',
    notes: 'Interesse em um sistema de catálogo digital com checkout simplificado.',
    lastContact: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: 'lead-2',
    name: 'TechCorp S.A',
    company: 'TechCorp Software',
    email: 'vitor@techcorp.io',
    phone: '(11) 92345-6789',
    stage: 'negociacao',
    estimatedValue: 72000,
    source: 'Indicação',
    notes: 'Contrato corporativo anual para sustentação de infraestrutura cloud.',
    lastContact: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    clientId: 'cli-1',
    clientName: 'GTS Telecom',
    name: 'App de Atendimento ao Cliente',
    description: 'Desenvolvimento do portal de atendimento personalizado integrada ao billing principal.',
    totalValue: 48000,
    status: 'em_andamento',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 45,
    stage: 'Desenvolvimento Frontend/Backend',
    assignedEmployeeIds: ['emp-1', 'emp-2'],
    installments: [
      { id: 'inst-1-1', value: 16000, dueDate: '2026-06-15', status: 'pago' },
      { id: 'inst-1-2', value: 16000, dueDate: '2026-07-15', status: 'pendente' },
      { id: 'inst-1-3', value: 16000, dueDate: '2026-08-15', status: 'pendente' }
    ]
  },
  {
    id: 'proj-2',
    clientId: 'cli-3',
    clientName: 'Inova Logística',
    name: 'Módulo de Rastreamento de Frotas',
    description: 'Sistema web mobile-first de rastreamento de entregas para os hubs logísticos.',
    totalValue: 32000,
    status: 'em_andamento',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 80,
    stage: 'Homologação e Testes Integrados',
    assignedEmployeeIds: ['emp-2', 'emp-3'],
    installments: [
      { id: 'inst-2-1', value: 16000, dueDate: '2026-05-10', status: 'pago' },
      { id: 'inst-2-2', value: 16000, dueDate: '2026-06-10', status: 'pago' }
    ]
  }
];

// Helper to get active user path
const getUserPath = (): string | null => {
  if (!useFirebase || !auth) return null;
  const user = auth.currentUser;
  return user ? `users/${user.uid}` : null;
};

// Local storage helpers
const getLocal = <T>(key: string, backup: T[]): T[] => {
  if (typeof window === 'undefined') return backup;
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(backup));
    return backup;
  }
  return JSON.parse(data);
};

const setLocal = <T>(key: string, data: T[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// CRUD API
export const getClients = async (): Promise<Client[]> => {
  const userPath = getUserPath();
  if (!userPath) return getLocal<Client>(CLIENTS_KEY, INITIAL_CLIENTS);

  try {
    const snap = await getDocs(collection(db, `${userPath}/clients`));
    const list: Client[] = [];
    snap.forEach((doc: any) => {
      list.push({ id: doc.id, ...doc.data() } as Client);
    });
    if (list.length === 0) {
      // Seed firestore too for better first-run experience
      for (const item of INITIAL_CLIENTS) {
        await saveClient(item);
      }
      return INITIAL_CLIENTS;
    }
    return list;
  } catch (e) {
    console.warn('Error reading clients from Firestore, using local backup:', e);
    return getLocal<Client>(CLIENTS_KEY, INITIAL_CLIENTS);
  }
};

export const saveClient = async (client: Client): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Client>(CLIENTS_KEY, INITIAL_CLIENTS);
    const index = list.findIndex(c => c.id === client.id);
    if (index >= 0) list[index] = client;
    else list.push(client);
    setLocal(CLIENTS_KEY, list);
    return;
  }

  try {
    await setDoc(doc(db, `${userPath}/clients`, client.id), client);
  } catch (e) {
    console.error('Failed to save client to Firestore:', e);
  }
};

export const getProjects = async (): Promise<Project[]> => {
  const userPath = getUserPath();
  if (!userPath) return getLocal<Project>(PROJECTS_KEY, INITIAL_PROJECTS);

  try {
    const snap = await getDocs(collection(db, `${userPath}/projects`));
    const list: Project[] = [];
    snap.forEach((doc: any) => {
      list.push({ id: doc.id, ...doc.data() } as Project);
    });
    if (list.length === 0) {
      for (const item of INITIAL_PROJECTS) {
        await saveProject(item);
      }
      return INITIAL_PROJECTS;
    }
    return list;
  } catch (e) {
    console.warn('Error reading projects from Firestore, using local backup:', e);
    return getLocal<Project>(PROJECTS_KEY, INITIAL_PROJECTS);
  }
};

export const saveProject = async (project: Project): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Project>(PROJECTS_KEY, INITIAL_PROJECTS);
    const index = list.findIndex(p => p.id === project.id);
    if (index >= 0) list[index] = project;
    else list.push(project);
    setLocal(PROJECTS_KEY, list);
    return;
  }

  try {
    await setDoc(doc(db, `${userPath}/projects`, project.id), project);
  } catch (e) {
    console.error('Failed to save project to Firestore:', e);
  }
};

export const getEmployees = async (): Promise<Employee[]> => {
  const userPath = getUserPath();
  if (!userPath) return getLocal<Employee>(EMPLOYEES_KEY, INITIAL_EMPLOYEES);

  try {
    const snap = await getDocs(collection(db, `${userPath}/employees`));
    const list: Employee[] = [];
    snap.forEach((doc: any) => {
      list.push({ id: doc.id, ...doc.data() } as Employee);
    });
    if (list.length === 0) {
      for (const item of INITIAL_EMPLOYEES) {
        await saveEmployee(item);
      }
      return INITIAL_EMPLOYEES;
    }
    return list;
  } catch (e) {
    console.warn('Error reading employees from Firestore, using local backup:', e);
    return getLocal<Employee>(EMPLOYEES_KEY, INITIAL_EMPLOYEES);
  }
};

export const saveEmployee = async (employee: Employee): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Employee>(EMPLOYEES_KEY, INITIAL_EMPLOYEES);
    const index = list.findIndex(e => e.id === employee.id);
    if (index >= 0) list[index] = employee;
    else list.push(employee);
    setLocal(EMPLOYEES_KEY, list);
    return;
  }

  try {
    await setDoc(doc(db, `${userPath}/employees`, employee.id), employee);
  } catch (e) {
    console.error('Failed to save employee to Firestore:', e);
  }
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Employee>(EMPLOYEES_KEY, INITIAL_EMPLOYEES);
    const updated = list.filter(e => e.id !== id);
    setLocal(EMPLOYEES_KEY, updated);
    return;
  }

  try {
    await deleteDoc(doc(db, `${userPath}/employees`, id));
  } catch (e) {
    console.error('Failed to delete employee from Firestore:', e);
  }
};

export const getLeads = async (): Promise<Lead[]> => {
  const userPath = getUserPath();
  if (!userPath) return getLocal<Lead>(LEADS_KEY, INITIAL_LEADS);

  try {
    const snap = await getDocs(collection(db, `${userPath}/leads`));
    const list: Lead[] = [];
    snap.forEach((doc: any) => {
      list.push({ id: doc.id, ...doc.data() } as Lead);
    });
    if (list.length === 0) {
      for (const item of INITIAL_LEADS) {
        await saveLead(item);
      }
      return INITIAL_LEADS;
    }
    return list;
  } catch (e) {
    console.warn('Error reading leads from Firestore, using local backup:', e);
    return getLocal<Lead>(LEADS_KEY, INITIAL_LEADS);
  }
};

export const saveLead = async (lead: Lead): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Lead>(LEADS_KEY, INITIAL_LEADS);
    const index = list.findIndex(l => l.id === lead.id);
    if (index >= 0) list[index] = lead;
    else list.push(lead);
    setLocal(LEADS_KEY, list);
    return;
  }

  try {
    await setDoc(doc(db, `${userPath}/leads`, lead.id), lead);
  } catch (e) {
    console.error('Failed to save lead to Firestore:', e);
  }
};

export const deleteLead = async (id: string): Promise<void> => {
  const userPath = getUserPath();
  if (!userPath) {
    const list = getLocal<Lead>(LEADS_KEY, INITIAL_LEADS);
    const updated = list.filter(l => l.id !== id);
    setLocal(LEADS_KEY, updated);
    return;
  }

  try {
    await deleteDoc(doc(db, `${userPath}/leads`, id));
  } catch (e) {
    console.error('Failed to delete lead from Firestore:', e);
  }
};

export const saveUserProfile = async (profile: { name: string, email: string }): Promise<void> => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('nexus_profile', JSON.stringify(profile));
  }
};
