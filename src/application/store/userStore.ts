/**
 * Store para la gestión del estado de los Usuarios
 * Utiliza Zustand para la gestión del estado
 * Permite cambiar entre diferentes fuentes de datos (GraphQL, REST, Mock)
 */
import { create } from 'zustand';
import { User, CreateUserInput, UpdateUserInput } from '../../domain/models/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { GraphQLUserRepository } from '../../infrastructure/adapters/graphql/GraphQLUserRepository';
import { MockUserRepository } from '../../infrastructure/adapters/mock/MockUserRepository';

// Tipo de fuente de datos (reutilizamos el mismo tipo que en todoStore)
export type DataSource = 'graphql' | 'mock';

// Estado de la store
interface UserState {
  // Datos
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Configuración
  dataSource: DataSource;
  repository: UserRepository;
  changeDataSource: (source: DataSource, config?: any) => void;
  
  // Acciones
  fetchUsers: () => Promise<void>;
  getUserById: (id: number) => Promise<User | null>;
  addUser: (input: CreateUserInput) => Promise<User>;
  updateUser: (input: UpdateUserInput) => Promise<User | null>;
  deleteUser: (id: number) => Promise<void>;
  selectUser: (id: number | null) => Promise<void>;
}

// Crear instancias de repositorios
const createRepository = (source: DataSource, config?: any): UserRepository => {
  switch (source) {
    case 'graphql':
      return new GraphQLUserRepository(config?.uri || undefined);
    case 'mock':
      return new MockUserRepository(config?.initialUsers || []);
    default:
      return new MockUserRepository();
  }
};

// Crear store con Zustand
export const useUserStore = create<UserState>((set, get) => ({
  // Estado inicial
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  dataSource: 'mock', // Por defecto usamos mock
  repository: createRepository('mock'),
  
  // Cambiar la fuente de datos
  changeDataSource: async (source: DataSource, config?: any) => {
    const repository = createRepository(source, config);
    set({ dataSource: source, repository });
    
    // Recargar los usuarios con la nueva fuente de datos
    await get().fetchUsers();
  },
  
  // Obtener todos los usuarios
  fetchUsers: async () => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const users = await repository.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al cargar los usuarios', 
        isLoading: false 
      });
    }
  },
  
  // Obtener un usuario por ID
  getUserById: async (id: number) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const user = await repository.getUserById(id);
      set({ isLoading: false });
      return user;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al obtener el usuario', 
        isLoading: false 
      });
      return null;
    }
  },
  
  // Añadir un nuevo usuario
  addUser: async (input: CreateUserInput): Promise<User> => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const newUser = await repository.createUser(input);
      set(state => ({ 
        users: [...state.users, newUser], 
        isLoading: false 
      }));
      return newUser;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al crear el usuario', 
        isLoading: false 
      });
      throw error; // Re-lanzamos el error para manejo adecuado
    }
  },
  
  // Actualizar un usuario existente
  updateUser: async (input: UpdateUserInput): Promise<User | null> => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const updatedUser = await repository.updateUser(input);
      if (updatedUser) {
        set(state => ({
          users: state.users.map(user => user.id === updatedUser.id ? updatedUser : user),
          selectedUser: state.selectedUser?.id === updatedUser.id ? updatedUser : state.selectedUser,
          isLoading: false
        }));
        return updatedUser; // Devolvemos el usuario actualizado
      }
      return null;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al actualizar el usuario', 
        isLoading: false 
      });
      throw error; // Re-lanzamos el error para manejo adecuado
    }
  },
  
  // Eliminar un usuario
  deleteUser: async (id: number) => {
    const { repository } = get();
    
    set({ isLoading: true, error: null });
    try {
      const success = await repository.deleteUser(id);
      if (success) {
        set(state => ({
          users: state.users.filter(user => user.id !== id),
          selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
          isLoading: false
        }));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al eliminar el usuario', 
        isLoading: false 
      });
    }
  },
  
  // Seleccionar un usuario
  selectUser: async (id: number | null) => {
    // Si se pasa null, deseleccionamos el usuario
    if (id === null) {
      set({ selectedUser: null });
      return;
    }
    
    // Buscar primero en el estado actual para evitar una petición innecesaria
    const { users, repository } = get();
    const userInState = users.find(user => user.id === id);
    
    if (userInState) {
      set({ selectedUser: userInState });
      return;
    }
    
    // Si no está en el estado, hacer una petición al repositorio
    set({ isLoading: true, error: null });
    try {
      const user = await repository.getUserById(id);
      set({ 
        selectedUser: user,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Error desconocido al seleccionar el usuario', 
        isLoading: false 
      });
    }
  }
}));