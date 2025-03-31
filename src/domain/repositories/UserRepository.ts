/**
 * Interfaz para el repositorio de Usuarios
 * Define las operaciones que se pueden realizar sobre los Usuarios
 * independientemente de la fuente de datos
 */
import { User, CreateUserInput, UpdateUserInput } from '../models/User';

export interface UserRepository {
  getUsers(): Promise<User[]>;
  getUserById(id: number): Promise<User | null>;
  createUser(input: CreateUserInput): Promise<User>;
  updateUser(input: UpdateUserInput): Promise<User | null>;
  deleteUser(id: number): Promise<boolean>;
}