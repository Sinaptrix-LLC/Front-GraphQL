/**
 * Modelo de dominio para la entidad Todo
 * Este modelo es agnóstico de la fuente de datos
 */
export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId?: number; // Referencia al id del usuario propietario de la tarea
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateTodoInput {
  title: string;
  completed?: boolean;
  userId?: number; // Permitir asignar un usuario al crear una tarea
}

export interface UpdateTodoInput {
  id: number;
  title?: string;
  completed?: boolean;
  userId?: number; // Permitir cambiar el usuario asignado
}