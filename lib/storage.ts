'use client';

import { Client, Project, Employee, Lead } from './types';
import { db, useFirebase, handleFirestoreError, auth } from './firebase';
import { collection, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';

const CLIENTS_KEY = 'nexus_clients';
const PROJECTS_KEY = 'nexus_projects';
const EMPLOYEES_KEY = 'nexus_employees';
const LEADS_KEY = 'nexus_leads';

// Helper to get user path
const getUserPath = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return `users/${user.uid}`;
};

// Helper for local storage (fallback)
const getLocal = (key: string) => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  const parsed = data ? JSON.parse(data) : [];
  // Filter by simulated user if needed, but for simplicity local is shared
  return parsed;
};

const saveLocal = (key: string, data: any[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const getClients = async (): Promise<Client[]> => {
  if (!useFirebase) return getLocal(CLIENTS_KEY);
  
  try {
    const path = `${getUserPath()}/clients`;
    console.log('Buscando clientes em:', path);
    const querySnapshot = await getDocs(collection(db, path));
    const clients: Client[] = [];
    querySnapshot.forEach((doc) => {
      clients.push(doc.data() as Client);
    });
    console.log(`Sucesso! ${clients.length} clientes encontrados.`);
    return clients;
  } catch (error: any) {
    console.error('Erro ao buscar clientes no Firestore:', error);
    if (error.code === 'permission-denied') {
      alert('Erro de permissão ao ler clientes. Verifique se seu UID está correto.');
    }
    return getLocal(CLIENTS_KEY);
  }
};

export const saveClient = async (client: Client) => {
  // Always save locally first as a cached copy or fallback
  const clients = getLocal(CLIENTS_KEY) as Client[];
  const index = clients.findIndex((c: Client) => c.id === client.id);
  if (index >= 0) clients[index] = client;
  else clients.push(client);
  saveLocal(CLIENTS_KEY, clients);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/clients`;
      console.log('Firebase: Salvando cliente em', path, client);
      await setDoc(doc(db, path, client.id), client);
      console.log('Firebase: Cliente salvo com sucesso!');
      alert('Cliente salvo no banco de dados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar cliente no Firebase:', error);
      handleFirestoreError(error, 'write', `clients/${client.id}`);
    }
  }
};

export const getProjects = async (): Promise<Project[]> => {
  if (!useFirebase) return getLocal(PROJECTS_KEY);
  
  try {
    const path = `${getUserPath()}/projects`;
    console.log('Firebase: Buscando projetos em', path);
    const querySnapshot = await getDocs(collection(db, path));
    const projects: Project[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data() as Project);
    });
    console.log(`Firebase: ${projects.length} projetos carregados.`);
    return projects;
  } catch (error: any) {
    console.error('Error fetching projects from Firebase:', error);
    return getLocal(PROJECTS_KEY);
  }
};

export const saveProject = async (project: Project) => {
  const projects = getLocal(PROJECTS_KEY) as Project[];
  const index = projects.findIndex((p: Project) => p.id === project.id);
  if (index >= 0) projects[index] = project;
  else projects.push(project);
  saveLocal(PROJECTS_KEY, projects);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/projects`;
      
      // Sanitizar projeto para evitar campos undefined no Firebase
      const sanitizedProject = {
        ...project,
        progress: project.progress ?? 0,
        stage: project.stage ?? 'Início',
        status: project.status ?? 'em_andamento',
        description: project.description ?? '',
        lastUpdate: project.lastUpdate ?? '',
        startDate: project.startDate ?? new Date().toISOString().split('T')[0],
        deadline: project.deadline ?? '',
        assignedEmployeeIds: project.assignedEmployeeIds ?? []
      };

      console.log('Firebase: Salvando projeto em', path, sanitizedProject);
      await setDoc(doc(db, path, project.id), sanitizedProject);
      console.log('Firebase: Projeto salvo com sucesso!');
      alert('Projeto salvo no banco de dados com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar projeto no Firebase:', error);
      handleFirestoreError(error, 'write', `projects/${project.id}`);
    }
  }
};

export const deleteClient = async (id: string) => {
  const clients = (getLocal(CLIENTS_KEY) as Client[]).filter((c: Client) => c.id !== id);
  saveLocal(CLIENTS_KEY, clients);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/clients`;
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `clients/${id}`);
    }
  }
};

export const deleteProject = async (id: string) => {
  const projects = (getLocal(PROJECTS_KEY) as Project[]).filter((p: Project) => p.id !== id);
  saveLocal(PROJECTS_KEY, projects);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/projects`;
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `projects/${id}`);
    }
  }
};

export const saveUserProfile = async (uid: string, profile: any) => {
  if (useFirebase) {
    try {
      console.log('Tentando salvar perfil para UID:', uid);
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        ...profile,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Perfil salvo com sucesso no Firestore para:', uid);
    } catch (error) {
      console.error('Erro detalhado ao salvar perfil:', error);
      alert('Erro ao salvar perfil no banco de dados. Verifique sua conexão ou permissões.');
    }
  }
};

export const getEmployees = async (): Promise<Employee[]> => {
  if (!useFirebase) return getLocal(EMPLOYEES_KEY);
  
  try {
    const path = `${getUserPath()}/employees`;
    const querySnapshot = await getDocs(collection(db, path));
    const employees: Employee[] = [];
    querySnapshot.forEach((doc) => {
      employees.push(doc.data() as Employee);
    });
    return employees;
  } catch (error: any) {
    console.error('Erro ao buscar funcionários no Firestore:', error);
    return getLocal(EMPLOYEES_KEY);
  }
};

export const saveEmployee = async (employee: Employee) => {
  const employees = getLocal(EMPLOYEES_KEY) as Employee[];
  const index = employees.findIndex((e: Employee) => e.id === employee.id);
  if (index >= 0) employees[index] = employee;
  else employees.push(employee);
  saveLocal(EMPLOYEES_KEY, employees);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/employees`;
      await setDoc(doc(db, path, employee.id), employee);
      alert('Funcionário salvo com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar funcionário no Firebase:', error);
      handleFirestoreError(error, 'write', `employees/${employee.id}`);
    }
  }
};

export const deleteEmployee = async (id: string) => {
  const employees = (getLocal(EMPLOYEES_KEY) as Employee[]).filter((e: Employee) => e.id !== id);
  saveLocal(EMPLOYEES_KEY, employees);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/employees`;
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `employees/${id}`);
    }
  }
};

export const getLeads = async (): Promise<Lead[]> => {
  if (!useFirebase) return getLocal(LEADS_KEY);
  
  try {
    const path = `${getUserPath()}/leads`;
    const querySnapshot = await getDocs(collection(db, path));
    const leads: Lead[] = [];
    querySnapshot.forEach((doc) => {
      leads.push(doc.data() as Lead);
    });
    return leads;
  } catch (error: any) {
    console.error('Erro ao buscar leads no Firestore:', error);
    return getLocal(LEADS_KEY);
  }
};

export const saveLead = async (lead: Lead) => {
  const leads = getLocal(LEADS_KEY) as Lead[];
  const index = leads.findIndex((l: Lead) => l.id === lead.id);
  if (index >= 0) leads[index] = lead;
  else leads.push(lead);
  saveLocal(LEADS_KEY, leads);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/leads`;
      await setDoc(doc(db, path, lead.id), lead);
    } catch (error: any) {
      console.error('Erro ao salvar lead no Firebase:', error);
      handleFirestoreError(error, 'write', `leads/${lead.id}`);
    }
  }
};

export const deleteLead = async (id: string) => {
  const leads = (getLocal(LEADS_KEY) as Lead[]).filter((l: Lead) => l.id !== id);
  saveLocal(LEADS_KEY, leads);

  if (useFirebase) {
    try {
      const path = `${getUserPath()}/leads`;
      await deleteDoc(doc(db, path, id));
    } catch (error) {
      handleFirestoreError(error, 'delete', `leads/${id}`);
    }
  }
};
