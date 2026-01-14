import { Routes } from '@angular/router';
import { Tasks } from './tasks/tasks';
import { TaskDetails } from './tasks/components/task-details/task-details';

export const routes: Routes = [
  { path: '', component: Tasks },
  { path: 'tasks/:id', component: TaskDetails },
];
