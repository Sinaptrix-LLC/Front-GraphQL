/**
 * Componente que define las rutas de la aplicación
 */
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { TodoList } from './TodoList';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { DataSourceSelector } from './DataSourceSelector';

export function Routes() {
  return (
    <RouterRoutes>
      {/* Redirección de la ruta principal a la sección de tareas */}
      <Route path="/" element={<Navigate to="/todos" replace />} />
      
      {/* Sección: Fuentes de datos */}
      <Route path="/datasources" element={<DataSourceSelector />} />
      
      {/* Sección: Gestión de usuarios */}
      <Route path="/users" element={<UserList />} />
      <Route path="/users/:id" element={<UserForm />} />
      
      {/* Sección: Administración de tareas */}
      <Route path="/todos" element={<TodoList />} />
    </RouterRoutes>
  );
}