/**
 * Implementación de TodoRepository para API REST
 * Utiliza axios para comunicarse con un servidor REST
 *
 * Este adaptador implementa la interfaz TodoRepository para conectar nuestra aplicación
 * con un servidor REST. Forma parte de la capa de infraestructura en nuestra
 * arquitectura hexagonal (también conocida como puertos y adaptadores).
 */
import axios, { AxiosInstance } from 'axios';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../../../domain/models/Todo';
import { TodoRepository } from '../../../domain/repositories/TodoRepository';

export class RestTodoRepository implements TodoRepository {
  /**
   * Cliente HTTP para realizar peticiones al servidor REST
   */
  private client: AxiosInstance;
  
  /**
   * Constructor que inicializa el cliente HTTP
   * @param baseUrl - URL base del servidor REST (por defecto: http://localhost:3000/api)
   */
  constructor(baseUrl: string = 'http://localhost:3000/api') {
    // Creamos una instancia de Axios con la URL base configurada
    this.client = axios.create({
      baseURL: baseUrl,
    });
  }

  /**
   * Obtiene todos los todos desde el servidor REST
   * @returns Una promesa que resuelve a un array con todos los todos
   */
  async getTodos(): Promise<Todo[]> {
    try {
      // Realizamos una petición GET a la ruta /todos
      const { data } = await this.client.get('/todos');
      
      // Transformamos las fechas de string a objeto Date para su uso en la aplicación
      return data.map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error fetching todos:', error);
      // En caso de error, devolvemos un array vacío
      return [];
    }
  }

  /**
   * Obtiene un todo por su ID desde el servidor REST
   * @param id - El ID del todo a buscar
   * @returns Una promesa que resuelve al todo encontrado o null si no existe
   */
  async getTodoById(id: string | number): Promise<Todo | null> {
    try {
      // Realizamos una petición GET a la ruta /todos/{id}
      const { data } = await this.client.get(`/todos/${id}`);
      if (!data) return null;

      // Transformamos las fechas de string a objeto Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error fetching todo by id:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo todo en el servidor REST
   * @param input - Datos para crear el todo
   * @returns Una promesa que resuelve al todo creado
   */
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    // Realizamos una petición POST a la ruta /todos con los datos de entrada
    const { data } = await this.client.post('/todos', input);
    
    // Transformamos las fechas de string a objeto Date
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  /**
   * Actualiza un todo existente en el servidor REST
   * @param input - Datos para actualizar el todo, incluyendo su ID
   * @returns Una promesa que resuelve al todo actualizado o null si no existe
   */
  async updateTodo(input: UpdateTodoInput): Promise<Todo | null> {
    try {
      // Realizamos una petición PATCH a la ruta /todos/{id} con los datos a actualizar
      const { data } = await this.client.patch(`/todos/${input.id}`, input);
      if (!data) return null;

      // Transformamos las fechas de string a objeto Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  /**
   * Elimina un todo por su ID en el servidor REST
   * @param id - El ID del todo a eliminar
   * @returns Una promesa que resuelve a true si se eliminó o false si hubo un error
   */
  async deleteTodo(id: string | number): Promise<boolean> {
    try {
      // Realizamos una petición DELETE a la ruta /todos/{id}
      await this.client.delete(`/todos/${id}`);
      // Si no hay errores, asumimos que se eliminó correctamente
      return true;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  /**
   * Cambia el estado de completado de un todo en el servidor REST
   * @param id - El ID del todo a modificar
   * @returns Una promesa que resuelve al todo modificado o null si no existe
   */
  async toggleComplete(id: string | number): Promise<Todo | null> {
    try {
      // Primero obtenemos el todo actual para conocer su estado
      const todo = await this.getTodoById(id);
      if (!todo) return null;

      // Luego realizamos una petición PATCH para cambiar solo el campo completed
      const { data } = await this.client.patch(`/todos/${id}`, {
        completed: !todo.completed,
      });

      // Transformamos las fechas de string a objeto Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error toggling todo complete status:', error);
      return null;
    }
  }
}