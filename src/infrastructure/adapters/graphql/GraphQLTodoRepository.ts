/**
 * Implementación de TodoRepository para GraphQL
 * Utiliza Apollo Client para comunicarse con un servidor GraphQL
 *
 * Este adaptador implementa la interfaz TodoRepository para conectar nuestra aplicación
 * con un servidor GraphQL. Forma parte de la capa de infraestructura en nuestra
 * arquitectura hexagonal (también conocida como puertos y adaptadores).
 */
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../../../domain/models/Todo';
import { TodoRepository } from '../../../domain/repositories/TodoRepository';

export class GraphQLTodoRepository implements TodoRepository {
  /**
   * Cliente Apollo para comunicarnos con el servidor GraphQL
   */
  private client: ApolloClient<any>;

  /**
   * Constructor que inicializa el cliente Apollo
   * @param uri - URL del servidor GraphQL (por defecto: http://localhost:4000/graphql)
   */
  constructor(uri: string = 'http://localhost:4000/graphql') {
    // Creamos una instancia de Apollo Client con la URI proporcionada
    // y una caché en memoria para almacenar resultados de consultas
    this.client = new ApolloClient({
      uri,
      cache: new InMemoryCache(),
    });
  }

  /**
   * Fragmento GraphQL con los campos comunes de Todo
   * Esto nos permite reutilizar la definición de campos en múltiples consultas
   */
  private TODO_FRAGMENTS = gql`
    fragment TodoFields on Todo {
      id
      title
      completed
      userId
      createdAt
      updatedAt
    }
  `;

  /**
   * Consulta para obtener todos los todos
   */
  private GET_TODOS = gql`
    query GetTodos {
      todos {
        ...TodoFields
      }
    }
    ${this.TODO_FRAGMENTS}
  `;

  /**
   * Consulta para obtener un todo por su ID
   */
  private GET_TODO_BY_ID = gql`
    query GetTodoById($id: ID!) {
      todo(id: $id) {
        ...TodoFields
      }
    }
    ${this.TODO_FRAGMENTS}
  `;

  /**
   * Mutación para crear un nuevo todo
   */
  private CREATE_TODO = gql`
    mutation CreateTodo($input: CreateTodoInput!) {
      createTodo(input: $input) {
        ...TodoFields
      }
    }
    ${this.TODO_FRAGMENTS}
  `;

  /**
   * Mutación para actualizar un todo existente
   */
  private UPDATE_TODO = gql`
    mutation UpdateTodo($input: UpdateTodoInput!) {
      updateTodo(input: $input) {
        ...TodoFields
      }
    }
    ${this.TODO_FRAGMENTS}
  `;

  /**
   * Mutación para eliminar un todo
   */
  private DELETE_TODO = gql`
    mutation DeleteTodo($id: ID!) {
      deleteTodo(id: $id)
    }
  `;

  /**
   * Mutación para cambiar el estado de completado de un todo
   */
  private TOGGLE_COMPLETE = gql`
    mutation ToggleComplete($id: ID!) {
      toggleComplete(id: $id) {
        ...TodoFields
      }
    }
    ${this.TODO_FRAGMENTS}
  `;

  /**
   * Obtiene todos los todos desde el servidor GraphQL
   * @returns Una promesa que resuelve a un array con todos los todos
   */
  async getTodos(): Promise<Todo[]> {
    // Ejecutamos la consulta GraphQL, especificando que siempre queremos
    // obtener los datos desde la red y no desde la caché
    const { data } = await this.client.query({
      query: this.GET_TODOS,
      fetchPolicy: 'network-only',
    });

    // Transformar las fechas de string a objeto Date para su uso en la aplicación
    return data.todos.map((todo: any) => ({
      ...todo,
      createdAt: new Date(todo.createdAt),
      updatedAt: todo.updatedAt ? new Date(todo.updatedAt) : undefined,
    }));
  }

  /**
   * Obtiene un todo por su ID desde el servidor GraphQL
   * @param id - El ID del todo a buscar
   * @returns Una promesa que resuelve al todo encontrado o null si no existe
   */
  async getTodoById(id: string): Promise<Todo | null> {
    try {
      // Ejecutamos la consulta GraphQL con el ID como variable
      const { data } = await this.client.query({
        query: this.GET_TODO_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only',
      });

      // Si no se encontró el todo, retornamos null
      if (!data.todo) return null;

      // Transformamos las fechas de string a objeto Date
      return {
        ...data.todo,
        createdAt: new Date(data.todo.createdAt),
        updatedAt: data.todo.updatedAt ? new Date(data.todo.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error fetching todo by id:', error);
      return null;
    }
  }

  /**
   * Crea un nuevo todo en el servidor GraphQL
   * @param input - Datos para crear el todo
   * @returns Una promesa que resuelve al todo creado
   */
  async createTodo(input: CreateTodoInput): Promise<Todo> {
    try {
      // Ejecutamos la mutación GraphQL con los datos de entrada
      const { data } = await this.client.mutate({
        mutation: this.CREATE_TODO,
        variables: { input },
      });

      // Verificamos que exista la respuesta
      if (!data.createTodo) {
        throw new Error('No se pudo crear el todo');
      }

      // Transformamos las fechas de string a objeto Date
      return {
        ...data.createTodo,
        createdAt: new Date(data.createTodo.createdAt),
        updatedAt: data.createTodo.updatedAt ? new Date(data.createTodo.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error creating todo:', error);
      throw error;
    }
  }

  /**
   * Actualiza un todo existente en el servidor GraphQL
   * @param input - Datos para actualizar el todo, incluyendo su ID
   * @returns Una promesa que resuelve al todo actualizado o null si no existe
   */
  async updateTodo(input: UpdateTodoInput): Promise<Todo | null> {
    try {
      // Ejecutamos la mutación GraphQL con los datos de entrada
      const { data } = await this.client.mutate({
        mutation: this.UPDATE_TODO,
        variables: { input },
      });

      // Si no se encontró el todo, retornamos null
      if (!data.updateTodo) return null;

      // Transformamos las fechas de string a objeto Date
      return {
        ...data.updateTodo,
        createdAt: new Date(data.updateTodo.createdAt),
        updatedAt: data.updateTodo.updatedAt ? new Date(data.updateTodo.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error updating todo:', error);
      return null;
    }
  }

  /**
   * Elimina un todo por su ID en el servidor GraphQL
   * @param id - El ID del todo a eliminar
   * @returns Una promesa que resuelve a true si se eliminó o false si hubo un error
   */
  async deleteTodo(id: string): Promise<boolean> {
    try {
      // Ejecutamos la mutación GraphQL con el ID como variable
      const { data } = await this.client.mutate({
        mutation: this.DELETE_TODO,
        variables: { id },
      });

      // El servidor devuelve true si se eliminó correctamente
      return data.deleteTodo;
    } catch (error) {
      console.error('Error deleting todo:', error);
      return false;
    }
  }

  /**
   * Cambia el estado de completado de un todo en el servidor GraphQL
   * @param id - El ID del todo a modificar
   * @returns Una promesa que resuelve al todo modificado o null si no existe
   */
  async toggleComplete(id: string): Promise<Todo | null> {
    try {
      // Ejecutamos la mutación GraphQL con el ID como variable
      const { data } = await this.client.mutate({
        mutation: this.TOGGLE_COMPLETE,
        variables: { id },
      });

      // Si no se encontró el todo, retornamos null
      if (!data.toggleComplete) return null;

      // Transformamos las fechas de string a objeto Date
      return {
        ...data.toggleComplete,
        createdAt: new Date(data.toggleComplete.createdAt),
        updatedAt: data.toggleComplete.updatedAt ? new Date(data.toggleComplete.updatedAt) : undefined,
      };
    } catch (error) {
      console.error('Error toggling todo complete status:', error);
      return null;
    }
  }
}