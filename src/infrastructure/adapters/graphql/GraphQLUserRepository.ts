/**
 * Implementación de UserRepository para GraphQL
 * Utiliza Apollo Client para comunicarse con un servidor GraphQL
 *
 * Este adaptador implementa la interfaz UserRepository para conectar nuestra aplicación
 * con un servidor GraphQL. Forma parte de la capa de infraestructura en nuestra
 * arquitectura hexagonal (también conocida como puertos y adaptadores).
 */
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { User, CreateUserInput, UpdateUserInput } from '../../../domain/models/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';

export class GraphQLUserRepository implements UserRepository {
  /**
   * Cliente Apollo para comunicarnos con el servidor GraphQL
   */
  private client: ApolloClient<any>;

  /**
   * Constructor que inicializa el cliente Apollo
   * @param uri - URI del servidor GraphQL
   */
  constructor(uri: string = 'http://localhost:4000/graphql') {
    this.client = new ApolloClient({
      uri,
      cache: new InMemoryCache(),
    });
  }

  /**
   * Obtiene todos los usuarios
   * @returns Promesa con la lista de usuarios
   */
  async getUsers(): Promise<User[]> {
    const { data } = await this.client.query({
      query: gql`
        query GetUsers {
          users {
            id
            name
            email
            createdAt
            updatedAt
          }
        }
      `,
    });

    // Convertir string de fechas a objetos Date
    return data.users.map((user: any) => ({
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
    const { data } = await this.client.query({
      query: gql`
        query GetUser($id: ID!) {
          user(id: $id) {
            id
            name
            email
            createdAt
            updatedAt
          }
        }
      `,
      variables: { id },
    });

    if (!data.user) return null;

    // Convertir string de fechas a objetos Date
    return {
      ...data.user,
      createdAt: new Date(data.user.createdAt),
      updatedAt: data.user.updatedAt ? new Date(data.user.updatedAt) : undefined,
    };
  }

  /**
   * Crea un nuevo usuario
   * @param input - Datos del usuario a crear
   * @returns Promesa con el usuario creado
   */
  async createUser(input: CreateUserInput): Promise<User> {
    const { data } = await this.client.mutate({
      mutation: gql`
        mutation CreateUser($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            name
            email
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input },
    });

    // Convertir string de fechas a objetos Date
    return {
      ...data.createUser,
      createdAt: new Date(data.createUser.createdAt),
      updatedAt: data.createUser.updatedAt ? new Date(data.createUser.updatedAt) : undefined,
    };
  }

  /**
   * Actualiza un usuario existente
   * @param input - Datos del usuario a actualizar
   * @returns Promesa con el usuario actualizado o null si no existe
   */
  async updateUser(input: UpdateUserInput): Promise<User | null> {
    const { data } = await this.client.mutate({
      mutation: gql`
        mutation UpdateUser($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            name
            email
            createdAt
            updatedAt
          }
        }
      `,
      variables: { input },
    });

    if (!data.updateUser) return null;

    // Convertir string de fechas a objetos Date
    return {
      ...data.updateUser,
      createdAt: new Date(data.updateUser.createdAt),
      updatedAt: data.updateUser.updatedAt ? new Date(data.updateUser.updatedAt) : undefined,
    };
  }

  /**
   * Elimina un usuario
   * @param id - ID del usuario a eliminar
   * @returns Promesa con true si se eliminó correctamente, false si no existía
   */
  async deleteUser(id: number): Promise<boolean> {
    const { data } = await this.client.mutate({
      mutation: gql`
        mutation DeleteUser($id: ID!) {
          deleteUser(id: $id)
        }
      `,
      variables: { id },
    });

    return data.deleteUser;
  }
}