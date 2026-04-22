export type ProjectStatus = 'em_andamento' | 'atrasado' | 'proximo_ao_prazo' | 'concluido';

export interface Installment {
  id: string;
  value: number;
  dueDate: string;
  status: 'pendente' | 'pago' | 'atrasado';
}

export interface Client {
  id: string;
  name: string;
  cnpj: string;
  companyName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string; // cargo
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  description: string;
  totalValue: number;
  status: ProjectStatus;
  startDate: string;
  deadline: string;
  installments: Installment[];
  stage: string; // estágio atual do projeto
  assignedEmployeeIds?: string[]; // IDs dos funcionários designados ao projeto
}
