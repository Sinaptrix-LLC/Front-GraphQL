/**
 * Archivo que contiene los datos semilla (seed data) para los repositorios mock
 * Separa la generación de datos de ejemplo de la lógica de los repositorios
 * para mejorar la organización y mantenibilidad del código
 */

import { User } from '../../../domain/models/User';
import { Todo } from '../../../domain/models/Todo';

/**
 * Genera datos de ejemplo para usuarios
 * @param nextId - El siguiente ID disponible para asignar
 * @returns Lista de usuarios de ejemplo
 */
export const generateUserSeedData = (nextId: number): User[] => {
  const now = new Date();
  return [
    {
      id: nextId++,
      name: 'Juan Pérez',
      email: 'juan@example.com',
      createdAt: now
    },
    {
      id: nextId++,
      name: 'María López',
      email: 'maria@example.com',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) // 1 día antes
    },
    {
      id: nextId++,
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) // 2 días antes
    }
  ];
};

/**
 * Genera datos de ejemplo para tareas (todos)
 * @param nextId - El siguiente ID disponible para asignar
 * @returns Lista de tareas de ejemplo
 */
export const generateTodoSeedData = (nextId: number): Todo[] => {
  const seedTodos: Todo[] = [];
  
  // Crear fechas base para simular diferentes momentos de creación
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // Tareas completadas
  seedTodos.push({
    id: nextId++,
    title: 'Revisar documentación de GraphQL',
    completed: true,
    userId: 1,  // Asignamos un userId por defecto
    createdAt: lastMonth,
    updatedAt: lastWeek
  });
  
  seedTodos.push({
    id: nextId++,
    title: 'Configurar entorno de desarrollo',
    completed: true,
    userId: 1,  // Asignamos un userId por defecto
    createdAt: lastMonth,
    updatedAt: lastWeek
  });
  
  seedTodos.push({
    id: nextId++,
    title: 'Implementar componente TodoList',
    completed: true,
    userId: 2,  // Asignamos un userId diferente
    createdAt: lastWeek,
    updatedAt: yesterday
  });
  
  // Tareas pendientes
  seedTodos.push({
    id: nextId++,
    title: 'Optimizar consultas GraphQL',
    completed: false,
    userId: 2,  // Asignamos un userId
    createdAt: yesterday
  });
  
  seedTodos.push({
    id: nextId++,
    title: 'Implementar filtros de búsqueda',
    completed: false,
    userId: 1,  // Asignamos un userId
    createdAt: yesterday
  });
  
  seedTodos.push({
    id: nextId++,
    title: 'Añadir pruebas unitarias',
    completed: false,
    userId: 3,  // Asignamos un userId diferente
    createdAt: now
  });
  
  seedTodos.push({
    id: nextId++,
    title: 'Mejorar estilos CSS',
    completed: false,
    userId: 3,  // Asignamos un userId
    createdAt: now
  });
  
  return seedTodos;
};