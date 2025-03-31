/**
 * Implementación de TodoRepository para mocks con persistencia en localStorage
 * Permite probar la aplicación sin depender de servicios externos y mantener
 * los datos entre recargas del navegador
 *
 * Esta clase implementa el patrón Repositorio de la arquitectura hexagonal,
 * actuando como un adaptador que conecta la capa de dominio con una fuente
 * de datos simulada que persiste en el localStorage del navegador.
 */

// Ya no necesitamos UUID, usaremos identificadores secuenciales
import { Todo, CreateTodoInput, UpdateTodoInput } from '../../../domain/models/Todo';
import { TodoRepository } from '../../../domain/repositories/TodoRepository';
import { generateTodoSeedData } from './mockSeeds';

/**
 * Clave utilizada para guardar los todos en localStorage
 */
const LOCAL_STORAGE_KEY = 'mock_todos';

export class MockTodoRepository implements TodoRepository {
  /**
   * Almacenamiento en memoria de los todos
   * Se sincroniza con localStorage al realizar cambios
   */
  private todos: Todo[] = [];
  
  // Contador para generar IDs secuenciales
  private nextId: number = 1;

  /**
   * Constructor que inicializa el repositorio
   * @param initialTodos - Lista opcional de todos iniciales para cargar
   */
  constructor(initialTodos: Todo[] = []) {
    // Intentar recuperar datos del localStorage primero
    this.loadFromLocalStorage();
    
    // Si no hay datos en localStorage o se proporciona initialTodos, usar initialTodos
    if (this.todos.length === 0) {
      if (initialTodos.length > 0) {
        this.todos = [...initialTodos];
        this.saveToLocalStorage();
      }
      // Ya no generamos datos de semilla automáticamente al iniciar
      // Los datos solo se generarán cuando se use el botón específico
    }
  }
  
  /**
   * Guarda los todos actuales en localStorage
   * Convierte las fechas a formato ISO para poder serializarlas en JSON
   */
  private saveToLocalStorage(): void {
    try {
      // Convertir las fechas a strings para JSON
      const todosToSave = this.todos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        updatedAt: todo.updatedAt ? todo.updatedAt.toISOString() : undefined
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todosToSave));
    } catch (error) {
      console.error('Error al guardar todos en localStorage:', error);
    }
  }
  
  /**
   * Carga los todos desde localStorage
   * Convierte las fechas de strings a objetos Date
   */
  private loadFromLocalStorage(): void {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        // Convertir las fechas de strings a objetos Date
        const parsedData = JSON.parse(storedData);
        this.todos = parsedData.map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined
        }));
      }
    } catch (error) {
      console.error('Error al cargar todos desde localStorage:', error);
      this.todos = [];
    }
  }
  
  /**
   * Limpia todos los todos del localStorage
   * Útil para reiniciar la aplicación a un estado inicial
   */
  public clearLocalStorage(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      this.todos = [];
    } catch (error) {
      console.error('Error al limpiar todos del localStorage:', error);
    }
  }

  /**
   * Llena el localStorage con datos de ejemplo
   * Útil para tener una base de datos inicial para pruebas
   */
  public fillWithSampleData(): void {
    try {
      this.todos = this.generateSeedData();
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error al llenar localStorage con datos de ejemplo:', error);
    }
  }
  
  /**
   * Genera datos de ejemplo para la aplicación utilizando los datos semilla
   * Crea una variedad de tareas con diferentes estados y fechas
   * para proporcionar un estado inicial realista a la aplicación
   */
  private generateSeedData(): Todo[] {
    // Utilizamos la función del archivo de seeds y pasamos el nextId actual
    const todos = generateTodoSeedData(this.nextId);
    
    // Actualizamos el nextId basado en las tareas generadas
    if (todos.length > 0) {
      this.nextId = Math.max(...todos.map(todo => todo.id)) + 1;
    }
    
    return todos;
  }

  /**
   * Obtiene todos los todos
   * @returns Una promesa que resuelve a un array con todos los todos
   */
  async getTodos(): Promise<Todo[]> {
    return [...this.todos];
  }

  /**
   * Obtiene un todo por su ID
   * @param id - El ID del todo a buscar
   * @returns Una promesa que resuelve al todo encontrado o null si no existe
   */
  async getTodoById(id: string | number): Promise<Todo | null> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const todo = this.todos.find((todo) => todo.id === numericId);
    return todo ? { ...todo } : null;
  }

  /**
   * Crea un nuevo todo
   * @param input - Datos para crear el todo
   * @returns Una promesa que resuelve al todo creado
   */
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    const newTodo: Todo = {
      id: this.nextId++,
      title: input.title,
      completed: input.completed || false,
      userId: input.userId,  // Agregamos el userId del input
      createdAt: new Date(),
    };

    this.todos.push(newTodo);
    this.saveToLocalStorage();
    return { ...newTodo };
  }

  /**
   * Actualiza un todo existente
   * @param input - Datos para actualizar el todo, incluyendo su ID
   * @returns Una promesa que resuelve al todo actualizado o null si no existe
   */
  async updateTodo(input: UpdateTodoInput): Promise<Todo | null> {
    const index = this.todos.findIndex((todo) => todo.id === input.id);
    if (index === -1) return null;

    const updatedTodo = {
      ...this.todos[index],
      ...(input.title && { title: input.title }),
      ...(input.completed !== undefined && { completed: input.completed }),
      ...(input.userId !== undefined && { userId: input.userId }),  // Agregamos la actualización del userId
      updatedAt: new Date()
    };

    this.todos[index] = updatedTodo;
    this.saveToLocalStorage();
    return { ...updatedTodo };
  }

  /**
   * Elimina un todo por su ID
   * @param id - El ID del todo a eliminar
   * @returns Una promesa que resuelve a true si se eliminó o false si no existía
   */
  async deleteTodo(id: string | number): Promise<boolean> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const initialLength = this.todos.length;
    this.todos = this.todos.filter((todo) => todo.id !== numericId);
    const deleted = this.todos.length !== initialLength;
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  /**
   * Cambia el estado de completado de un todo
   * @param id - El ID del todo a modificar
   * @returns Una promesa que resuelve al todo modificado o null si no existe
   */
  async toggleComplete(id: string | number): Promise<Todo | null> {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const index = this.todos.findIndex((todo) => todo.id === numericId);
    if (index === -1) return null;

    const updatedTodo = {
      ...this.todos[index],
      completed: !this.todos[index].completed,
      updatedAt: new Date()
    };

    this.todos[index] = updatedTodo;
    this.saveToLocalStorage();
    return { ...updatedTodo };
  }
}