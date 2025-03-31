/**
 * Implementación de UserRepository para mocks con persistencia en localStorage
 * Permite probar la aplicación sin depender de servicios externos y mantener
 * los datos entre recargas del navegador
 */

// Ya no necesitamos UUID, usaremos identificadores secuenciales
import { User, CreateUserInput, UpdateUserInput } from '../../../domain/models/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';
import { generateUserSeedData } from './mockSeeds';

/**
 * Clave utilizada para guardar los usuarios en localStorage
 */
const LOCAL_STORAGE_KEY = 'mock_users';

export class MockUserRepository implements UserRepository {
  /**
   * Almacenamiento en memoria de los usuarios
   * Se sincroniza con localStorage al realizar cambios
   */
  private users: User[] = [];
  
  // Contador para generar IDs secuenciales
  private nextId: number = 1;

  /**
   * Constructor que inicializa el repositorio
   * @param initialUsers - Lista opcional de usuarios iniciales para cargar
   */
  constructor(initialUsers: User[] = []) {
    // Intentar recuperar datos del localStorage primero
    this.loadFromLocalStorage();
    
    // Si no hay datos en localStorage o se proporciona initialUsers, usar initialUsers
    if (this.users.length === 0) {
      if (initialUsers.length > 0) {
        this.users = [...initialUsers];
        this.saveToLocalStorage();
      }
      // Ya no generamos datos de semilla automáticamente al iniciar
      // Los datos solo se generarán cuando se use el botón específico
    }
  }
  
  /**
   * Guarda los usuarios actuales en localStorage
   * Convierte las fechas a formato ISO para poder serializarlas en JSON
   */
  private saveToLocalStorage(): void {
    try {
      const serializedUsers = JSON.stringify(this.users, (key, value) => {
        // Convertir fechas a formato ISO para serialización
        if (key === 'createdAt' || key === 'updatedAt') {
          return value instanceof Date ? value.toISOString() : value;
        }
        return value;
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, serializedUsers);
    } catch (error) {
      console.error('Error al guardar usuarios en localStorage:', error);
    }
  }

  /**
   * Carga los usuarios desde localStorage
   * Convierte las cadenas de fecha ISO a objetos Date
   * Actualiza nextId basándose en el mayor ID existente para evitar duplicados
   */
  private loadFromLocalStorage(): void {
    try {
      const serializedUsers = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (serializedUsers) {
        // Parsear y convertir las fechas ISO a objetos Date
        this.users = JSON.parse(serializedUsers, (key, value) => {
          if (key === 'createdAt' || key === 'updatedAt') {
            return value ? new Date(value) : value;
          }
          return value;
        });
        
        // Actualizar nextId basándose en el ID más alto existente
        // para evitar generar IDs duplicados después de recargar la página
        if (this.users.length > 0) {
          const maxId = Math.max(...this.users.map(user => user.id));
          this.nextId = maxId + 1;
        }
      }
    } catch (error) {
      console.error('Error al cargar usuarios desde localStorage:', error);
      this.users = [];
    }
  }

  /**
   * Genera datos de ejemplo para el repositorio utilizando los datos semilla
   * @returns Lista de usuarios de ejemplo
   */
  private generateSeedData(): User[] {
    // Utilizamos la función del archivo de seeds y pasamos el nextId actual
    const users = generateUserSeedData(this.nextId);
    
    // Actualizamos el nextId basado en los usuarios generados
    if (users.length > 0) {
      this.nextId = Math.max(...users.map(user => user.id)) + 1;
    }
    
    return users;
  }
  
  /**
   * Limpia todos los usuarios del localStorage
   * Útil para reiniciar la aplicación a un estado inicial
   */
  public clearLocalStorage(): void {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      this.users = [];
    } catch (error) {
      console.error('Error al limpiar usuarios del localStorage:', error);
    }
  }

  /**
   * Llena el localStorage con datos de ejemplo
   * Útil para tener una base de datos inicial para pruebas
   */
  public fillWithSampleData(): void {
    try {
      this.users = this.generateSeedData();
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Error al llenar localStorage con datos de ejemplo:', error);
    }
  }

  /**
   * Obtiene todos los usuarios
   * @returns Promesa con la lista de usuarios
   */
  async getUsers(): Promise<User[]> {
    // Simulamos una operación asíncrona
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([...this.users]);
      }, 200);
    });
  }

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns Promesa con el usuario encontrado o null si no existe
   */
  async getUserById(id: number): Promise<User | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const user = this.users.find(user => user.id === id) || null;
        resolve(user);
      }, 200);
    });
  }

  /**
   * Crea un nuevo usuario
   * @param input - Datos del usuario a crear
   * @returns Promesa con el usuario creado
   */
  async createUser(input: CreateUserInput): Promise<User> {
    return new Promise(resolve => {
      setTimeout(() => {
        const now = new Date();
        const newUser: User = {
          id: this.nextId++,
          name: input.name,
          email: input.email,
          createdAt: now
        };
        
        this.users.push(newUser);
        this.saveToLocalStorage();
        
        resolve({ ...newUser });
      }, 200);
    });
  }

  /**
   * Actualiza un usuario existente
   * @param input - Datos del usuario a actualizar
   * @returns Promesa con el usuario actualizado o null si no existe
   */
  async updateUser(input: UpdateUserInput): Promise<User | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = this.users.findIndex(user => user.id === input.id);
        
        if (index === -1) {
          resolve(null);
          return;
        }
        
        // Creamos una copia del usuario actual
        const updatedUser: User = { ...this.users[index] };
        
        // Actualizamos solo los campos proporcionados
        if (input.name !== undefined) updatedUser.name = input.name;
        if (input.email !== undefined) updatedUser.email = input.email;
        
        // Actualizamos la fecha de modificación
        updatedUser.updatedAt = new Date();
        
        // Reemplazamos el usuario en la lista
        this.users[index] = updatedUser;
        this.saveToLocalStorage();
        
        resolve({ ...updatedUser });
      }, 200);
    });
  }

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Promesa con true si se eliminó correctamente, false si no existía
   */
  async deleteUser(id: number): Promise<boolean> {
    return new Promise(resolve => {
      setTimeout(() => {
        const initialLength = this.users.length;
        this.users = this.users.filter(user => user.id !== id);
        
        const deleted = initialLength > this.users.length;
        if (deleted) {
          this.saveToLocalStorage();
        }
        
        resolve(deleted);
      }, 200);
    });
  }
}