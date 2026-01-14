export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}