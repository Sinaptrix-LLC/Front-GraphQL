/**
 * Implementación de UserRepository para API REST
 * Utiliza axios para comunicarse con un servidor REST
 *
 * Este adaptador implementa la interfaz UserRepository para conectar nuestra aplicación
 * con un servidor REST. Forma parte de la capa de infraestructura en nuestra
 * arquitectura hexagonal (también conocida como puertos y adaptadores).
 */
import axios, { AxiosInstance } from 'axios';
import { User, CreateUserInput, UpdateUserInput } from '../../../domain/models/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class RestUserRepository implements UserRepository {
  /**
   * Cliente HTTP para realizar peticiones al servidor REST
   */
  private client: AxiosInstance;

  /**
   * Constructor que inicializa el cliente HTTP
   * @param baseUrl - URL base del servidor REST
   */
  constructor(baseUrl: string = 'http://localhost:3000/api') {
    this.client = axios.create({
      baseURL: baseUrl,
    });
  }

  /**
   * Obtiene todos los usuarios
   * @returns Promesa con la lista de usuarios
   */
  async getUsers(): Promise<User[]> {
    const { data } = await this.client.get('/users');
    
    // Convertir string de fechas a objetos Date
    return data.map((user: any) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: user.updatedAt ? new Date(user.updatedAt) : undefined,
    }));
  }

  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns Promesa con el usuario encontrado o null si no existe
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const { data } = await this.client.get(`/users/${id}`);
      
      // Convertir string de fechas a objetos Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      // Si es un error 404, devolvemos null
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param input - Datos del usuario a crear
   * @returns Promesa con el usuario creado
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const { data } = await this.client.post('/users', input);
    
    // Convertir string de fechas a objetos Date
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    };
  }

  /**
   * Actualiza un usuario existente
   * @param input - Datos del usuario a actualizar
   * @returns Promesa con el usuario actualizado o null si no existe
   */
  async updateUser(input: UpdateUserInput): Promise<User | null> {
    try {
      const { data } = await this.client.patch(`/users/${input.id}`, input);
      
      // Convertir string de fechas a objetos Date
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
      };
    } catch (error) {
      // Si es un error 404, devolvemos null
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Promesa con true si se eliminó correctamente, false si no existía
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      await this.client.delete(`/users/${id}`);
      return true;
    } catch (error) {
      // Si es un error 404, consideramos que el usuario no existía
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return false;
      }
      throw error;
    }
  }
}