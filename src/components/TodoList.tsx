/**
 * Componente para mostrar la lista de tareas (Todos) en formato tabla
 * Permite crear, editar, eliminar, filtrar, ordenar y marcar como completadas las tareas
 * También permite asignar tareas a usuarios
 */
import { useEffect, useState } from 'react';
import { Table, Form, Container, Row, Col, Card, InputGroup, Alert, Spinner, Badge } from 'react-bootstrap';
import { ActionButton, SearchInput, TableActionButtons, EditActionButtons } from './shared/UIComponents';
import { useTodoStore } from '../application/store/todoStore';
import { useUserStore } from '../application/store/userStore';
import { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/models/Todo';

export function TodoList() {
  const { 
    todos, 
    isLoading, 
    error, 
    fetchTodos, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoComplete 
  } = useTodoStore();
  
  // Utilizamos el store de usuarios para acceder a la lista de usuarios y el usuario seleccionado
  const { users, selectedUser, fetchUsers } = useUserStore();

  // Estado para el formulario de nueva tarea
  const [newTodoTitle, setNewTodoTitle] = useState('');
  // Estado para la tarea en edición
  const [editingTodo, setEditingTodo] = useState<{ id: number; title: string; userId?: number } | null>(null);
  // Estados para ordenación y filtrado
  const [sortField, setSortField] = useState<keyof Todo>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');

  // Cargar las tareas y usuarios al montar el componente
  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, [fetchTodos, fetchUsers]);

  // Manejar creación de nueva tarea
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      const newTodo: CreateTodoInput = {
        title: newTodoTitle.trim(),
        completed: false,
        userId: selectedUser?.id ? Number(selectedUser.id) : undefined // Asignar el usuario seleccionado a la tarea como número
      };
      addTodo(newTodo);
      setNewTodoTitle('');
    }
  };

  // Manejar actualización de tarea
  const handleUpdateTodo = () => {
    if (editingTodo && editingTodo.title.trim()) {
      const todoUpdate: UpdateTodoInput = {
        id: editingTodo.id,
        title: editingTodo.title.trim(),
        userId: editingTodo.userId ? Number(editingTodo.userId) : undefined // Mantener o actualizar el usuario asignado como número
      };
      updateTodo(todoUpdate);
      setEditingTodo(null);
    }
  };

  // Manejar cambio en el estado completado de una tarea
  const handleToggleComplete = (id: number) => {
    toggleTodoComplete(id);
  };

  // Iniciar edición de una tarea
  const startEditing = (id: number, title: string) => {
    const todo = todos.find(t => t.id === id);
    setEditingTodo({ id, title, userId: todo?.userId });
  };

  // Cancelar edición de una tarea
  const cancelEditing = () => {
    setEditingTodo(null);
  };

  // Formatear fecha
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Ordenar tareas
  const handleSort = (field: keyof Todo) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Obtener tareas filtradas y ordenadas
  const getSortedAndFilteredTodos = () => {
    return [...todos]
      .filter(todo => 
        todo.title.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => {
        if (sortField === 'createdAt' || sortField === 'updatedAt') {
          const aValue = a[sortField] instanceof Date ? a[sortField] as Date : new Date();
          const bValue = b[sortField] instanceof Date ? b[sortField] as Date : new Date();
          return sortDirection === 'asc' 
            ? aValue.getTime() - bValue.getTime() 
            : bValue.getTime() - aValue.getTime();
        } else if (sortField === 'completed') {
          return sortDirection === 'asc'
            ? (a.completed ? 1 : 0) - (b.completed ? 1 : 0)
            : (b.completed ? 1 : 0) - (a.completed ? 1 : 0);
        } else if (sortField === 'userId') {
          // Ordenación para el campo userId usando los nombres de usuario
          const aUserName = users.find(user => user.id === a.userId)?.name || '';
          const bUserName = users.find(user => user.id === b.userId)?.name || '';
          return sortDirection === 'asc'
            ? aUserName.localeCompare(bUserName)
            : bUserName.localeCompare(aUserName);
        } else {
          const aValue = String(a[sortField]).toLowerCase();
          const bValue = String(b[sortField]).toLowerCase();
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      });
  };

  // Obtener el ícono para la columna ordenada
  const getSortIcon = (field: keyof Todo) => {
    if (field !== sortField) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header as="h2" className="bg-primary text-white text-center py-3">Lista de Tareas</Card.Header>
        <Card.Body>
          {/* Formulario para crear nueva tarea */}
          <Row className="mb-4">
            <Col md={8}>
              <Form onSubmit={handleCreateTodo}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Nueva tarea..."
                  />
                  <ActionButton 
                    onClick={handleCreateTodo} 
                    variant="success" 
                    icon="plus-circle"
                  >
                    Agregar
                  </ActionButton>
                </InputGroup>
              </Form>
            </Col>
            <Col md={4}>
              <SearchInput
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Buscar tareas..."
              />
            </Col>
          </Row>

          {/* Mensaje de error */}
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Indicador de carga */}
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando tareas...</p>
            </div>
          ) : (
            <>
              {/* Tabla de tareas */}
              <Table responsive striped bordered hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th onClick={() => handleSort('completed')} style={{cursor: 'pointer'}}>
                      Completado {getSortIcon('completed')}
                    </th>
                    <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                      ID {getSortIcon('id')}
                    </th>
                    <th onClick={() => handleSort('title')} style={{cursor: 'pointer'}}>
                      Título {getSortIcon('title')}
                    </th>
                    <th onClick={() => handleSort('userId')} style={{cursor: 'pointer'}}>
                      Asignado a {getSortIcon('userId')}
                    </th>
                    <th onClick={() => handleSort('createdAt')} style={{cursor: 'pointer'}}>
                      Creado {getSortIcon('createdAt')}
                    </th>
                    <th onClick={() => handleSort('updatedAt')} style={{cursor: 'pointer'}}>
                      Actualizado {getSortIcon('updatedAt')}
                    </th>
                    <th className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedAndFilteredTodos().map((todo) => (
                    <tr key={todo.id} className={todo.completed ? 'table-success' : ''}>
                      <td className="text-center">
                        <Form.Check
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                        />
                      </td>
                      <td><Badge bg="secondary">{todo.id}</Badge></td>
                      <td>
                        {editingTodo && editingTodo.id === todo.id ? (
                          <Form.Control
                            type="text"
                            value={editingTodo.title}
                            onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                            autoFocus
                            size="sm"
                          />
                        ) : (
                          <span className={todo.completed ? 'text-decoration-line-through' : ''}>{todo.title}</span>
                        )}
                      </td>
                      <td>
                        {editingTodo && editingTodo.id === todo.id ? (
                          <Form.Select
                            size="sm"
                            value={editingTodo.userId?.toString() || ''}
                            onChange={(e) => setEditingTodo({ ...editingTodo, userId: e.target.value ? Number(e.target.value) : undefined })}
                          >
                            <option value="">Sin asignar</option>
                            {users.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </Form.Select>
                        ) : (
                          users.find(user => user.id === todo.userId)?.name || 
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>{formatDate(todo.createdAt)}</td>
                      <td>{todo.updatedAt ? formatDate(todo.updatedAt) : '-'}</td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          {editingTodo && editingTodo.id === todo.id ? (
                            <EditActionButtons
                              onSave={handleUpdateTodo}
                              onCancel={cancelEditing}
                            />
                          ) : (
                            <TableActionButtons
                              onEdit={() => startEditing(todo.id, todo.title)}
                              onDelete={() => deleteTodo(todo.id)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Mensaje cuando no hay tareas */}
              {todos.length === 0 && (
                <Alert variant="info" className="text-center mt-3">
                  No hay tareas. ¡Agrega una nueva!
                </Alert>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}