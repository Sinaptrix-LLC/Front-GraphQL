/**
 * Modelo de dominio para la entidad User
 * Este modelo es agnóstico de la fuente de datos
 */
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
}

export interface UpdateUserInput {
  id: number;
  name?: string;
  email?: string;
}