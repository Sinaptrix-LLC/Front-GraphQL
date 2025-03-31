/**
 * Interfaz para el repositorio de Todos
 * Define las operaciones que se pueden realizar sobre los Todos
 * independientemente de la fuente de datos
 */
import { Todo, CreateTodoInput, UpdateTodoInput } from '../models/Todo';

export interface TodoRepository {
  getTodos(): Promise<Todo[]>;
  getTodoById(id: string | number): Promise<Todo | null>;
  createTodo(input: CreateTodoInput): Promise<Todo>;
  updateTodo(input: UpdateTodoInput): Promise<Todo | null>;
  deleteTodo(id: string | number): Promise<boolean>;
  toggleComplete(id: string | number): Promise<Todo | null>;
}