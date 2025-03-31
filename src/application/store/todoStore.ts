/**
 * Store para la gestión del estado de los Todos
 * Utiliza Zustand para la gestión del estado
 * Permite cambiar entre diferentes fuentes de datos (GraphQL, REST, Mock)
 */
import { create } from 'zustand';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../../domain/models/Todo';
import { TodoRepository } from '../../domain/repositories/TodoRepository';
import { GraphQLTodoRepository } from '../../infrastructure/adapters/graphql/GraphQLTodoRepository';
import { MockTodoRepository } from '../../infrastructure/adapters/mock/MockTodoRepository';

// Tipo de fuente de datos
export type DataSource = 'graphql' | 'mock';

// Estado de la store
interface TodoState {
  // Datos
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  
  // Configuración
  dataSource: DataSource;
  repository: TodoRepository;
  changeDataSource: (source: DataSource, config?: any) => void;
  
  // Acciones
  fetchTodos: () => Promise<void>;
  addTodo: (input: CreateTodoInput) => Promise<void>;
  updateTodo: (input: UpdateTodoInput) => Promise<void>;
  deleteTodo: (id: string | number) => Promise<void>;
  toggleTodoComplete: (id: string | number) => Promise<void>;
}

// Crear instancias de repositorios
const createRepository = (source: DataSource, config?: any): TodoRepository => {
  switch (source) {
    case 'graphql':
      return new GraphQLTodoRepository(config?.uri);
    case 'mock':
      return new MockTodoRepository(config?.initialTodos || []);
    default:
      return new MockTodoRepository();
  }
};

// Crear store con Zustand
export const useTodoStore = create<TodoState>((set, get) => ({
  // Estado inicial
  todos: [],
  isLoading: false,
  error: null,
  dataSource: 'mock', // Por defecto usamos mock
  repository: createRepository('mock'),
  
  // Cambiar la fuente de datos
  changeDataSource: async (source: DataSource, config?: any) => {
    const repository = createRepository(source, config);
    set({ dataSource: source, repository });
    
    // Recargar los todos con la nueva fuente de datos
    await get().fetchTodos();
  },
  
  // Obtener todos los todos
  fetchTodos: async () => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const todos = await repository.getTodos();
      set({ todos, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar las tareas', 
        isLoading: false 
      });
    }
  },
  
  // Añadir un nuevo todo
  addTodo: async (input: CreateTodoInput) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const newTodo = await repository.createTodo(input);
      set(state => ({ 
        todos: [...state.todos, newTodo], 
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al crear la tarea', 
        isLoading: false 
      });
    }
  },
  
  // Actualizar un todo existente
  updateTodo: async (input: UpdateTodoInput) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await repository.updateTodo(input);
      if (updatedTodo) {
        set(state => ({
          todos: state.todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo),
          isLoading: false
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar la tarea', 
        isLoading: false 
      });
    }
  },
  
  // Eliminar un todo
  deleteTodo: async (id: string | number) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const success = await repository.deleteTodo(id);
      if (success) {
        set(state => ({
          todos: state.todos.filter(todo => todo.id !== id),
          isLoading: false
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar la tarea', 
        isLoading: false 
      });
    }
  },
  
  // Cambiar el estado de completado de un todo
  toggleTodoComplete: async (id: string | number) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const updatedTodo = await repository.toggleComplete(id);
      if (updatedTodo) {
        set(state => ({
          todos: state.todos.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo),
          isLoading: false
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cambiar el estado de la tarea', 
        isLoading: false 
      });
    }
  }
}));