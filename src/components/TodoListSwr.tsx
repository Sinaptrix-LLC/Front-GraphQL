/**
 * Componente para mostrar la lista de tareas implementado con SWR
 * Permite crear, editar, eliminar y marcar como completadas las tareas
 * Implementa funcionalidades de ordenamiento y filtrado similar al TodoList original
 */
import { useState } from 'react';
import { Table, Form, Container, Row, Col, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { LoadingButton, SearchInput, TableActionButtons, EditActionButtons } from './shared/UIComponents';
import { useTodos, useTodo } from '../application/hooks/useTodos';
import { useUsers, useDataSource } from '../application/hooks/useUsers';
import { CreateTodoInput, Todo, UpdateTodoInput } from '../domain/models/Todo';

export function TodoListSwr() {
  // Hooks SWR para tareas
  const { 
    todos, 
    isLoading, 
    isValidating,
    error, 
    addTodo, 
    updateTodo, 
    deleteTodo, 
    toggleTodoComplete,
    mutate: refreshTodos 
  } = useTodos();
  
  // Hook SWR para tarea seleccionada con ID inicial null (ninguna tarea seleccionada)
  const [selectedTodoId] = useState<number | null>(null);
  const { } = useTodo(selectedTodoId);
  
  // Hooks para usuarios
  const { users } = useUsers();
  
  // Hook para manejar el cambio de fuente de datos
  const { dataSource } = useDataSource();

  // Estado para el formulario de nueva tarea
  const [newTodoTitle, setNewTodoTitle] = useState('');
  // Estado para la tarea en edición
  const [editingTodo, setEditingTodo] = useState<{ id: number; title: string; userId?: number } | null>(null);
  // Estados para ordenación y filtrado
  const [sortField, setSortField] = useState<keyof Todo>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');
  // Estado para el usuario seleccionado para filtrar tareas
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Manejar creación de nueva tarea
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoTitle.trim()) {
      const newTodo: CreateTodoInput = {
        title: newTodoTitle.trim(),
        completed: false,
        userId: selectedUserId || undefined // Assign selected user to task, undefined if null
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
        userId: editingTodo.userId // Mantener o actualizar el usuario asignado
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
    }).format(new Date(date));
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

  // Filtrar tareas por texto y usuario seleccionado
  const filteredTodos = todos
    .filter(todo => 
      todo.title.toLowerCase().includes(filterText.toLowerCase()) &&
      (selectedUserId === null || todo.userId === selectedUserId)
    )
    .sort((a, b) => {
      const aValue = a[sortField] as any;
      const bValue = b[sortField] as any;
      
      // Manejar caso especial para fechas
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        // Función auxiliar para convertir cualquier tipo de fecha a timestamp
        const getTimestamp = (value: any): number => {
          if (value instanceof Date) return value.getTime();
          if (typeof value === 'string' || typeof value === 'number') return new Date(value).getTime();
          return 0;
        };
        
        const aDate = getTimestamp(aValue);
        const bDate = getTimestamp(bValue);
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      
      // Ordenamiento general
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Render de componente  
  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1>Lista de Tareas (SWR)</h1>
          <p className="text-muted">
            Implementado con SWR para gestión de estado y caché automática.
            Fuente de datos actual: <Badge bg="info">{dataSource}</Badge>
          </p>
        </Col>
      </Row>

      {/* Mostrar errores si existen */}
      {error && (
        <Alert variant="danger">
          Error al cargar las tareas: {error.toString()}
        </Alert>
      )}

      {/* Formulario para crear nueva tarea */}
      <Card className="mb-4">
        <Card.Header as="h5">Nueva Tarea</Card.Header>
        <Card.Body>
          <Form onSubmit={handleCreateTodo}>
            <Row>
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Título</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Escribe el título de la tarea"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Asignar a usuario</Form.Label>
                  <Form.Select 
                    value={selectedUserId || ''} 
                    onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">Sin asignar</option>
                    {users?.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end mt-3">
              <LoadingButton
                variant="primary"
                disabled={!newTodoTitle.trim()}
                isLoading={isLoading}
                loadingText="Guardando..."
                onClick={handleCreateTodo}
                icon="plus"
              >
                Agregar Tarea
              </LoadingButton>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Controles de filtrado y búsqueda */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <SearchInput
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Buscar por título..."
              />
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filtrar por usuario</Form.Label>
                <Form.Select 
                  value={selectedUserId || ''} 
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Todos los usuarios</option>
                  {users?.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <div className="d-flex h-100 align-items-end justify-content-end">
                <LoadingButton
                  variant="outline-secondary"
                  onClick={() => refreshTodos()}
                  isLoading={isValidating}
                  loadingText="Actualizando..."
                  disabled={isLoading}
                  icon="arrow-clockwise"
                >
                  Refrescar
                </LoadingButton>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabla de tareas */}
      {isLoading ? (
        <div className="text-center p-5">
          <Spinner animation="border" />
          <p className="mt-2">Cargando tareas...</p>
        </div>
      ) : (
        <>
          {filteredTodos.length === 0 ? (
            <Alert variant="info">
              No se encontraron tareas {filterText ? `que coincidan con "${filterText}"` : ''}.
            </Alert>
          ) : (
            <>
              <p>Mostrando {filteredTodos.length} tareas de {todos.length} en total</p>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th style={{width: '40px'}}>#</th>
                    <th 
                      style={{cursor: 'pointer'}} 
                      onClick={() => handleSort('title')}
                    >
                      Título {sortField === 'title' && (
                        sortDirection === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th style={{width: '120px'}}>Estado</th>
                    <th style={{width: '150px'}}>Usuario</th>
                    <th 
                      style={{width: '180px', cursor: 'pointer'}} 
                      onClick={() => handleSort('createdAt')}
                    >
                      Creada {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? '↑' : '↓'
                      )}
                    </th>
                    <th style={{width: '150px'}}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTodos.map(todo => (
                    <tr key={todo.id}>
                      <td>{todo.id}</td>
                      <td>
                        {editingTodo && editingTodo.id === todo.id ? (
                          <Form.Control
                            type="text"
                            value={editingTodo.title}
                            onChange={(e) => setEditingTodo({
                              ...editingTodo,
                              title: e.target.value
                            })}
                          />
                        ) : (
                          todo.title
                        )}
                      </td>
                      <td>
                        <Form.Check
                          type="switch"
                          id={`complete-switch-${todo.id}`}
                          label={todo.completed ? 'Completada' : 'Pendiente'}
                          checked={todo.completed}
                          onChange={() => handleToggleComplete(todo.id)}
                        />
                      </td>
                      <td>
                        {editingTodo && editingTodo.id === todo.id ? (
                          <Form.Select 
                            value={editingTodo.userId || ''} 
                            onChange={(e) => setEditingTodo({
                              ...editingTodo,
                              userId: e.target.value ? Number(e.target.value) : undefined
                            })}
                          >
                            <option value="">Sin asignar</option>
                            {users?.map(user => (
                              <option key={user.id} value={user.id}>{user.name}</option>
                            ))}
                          </Form.Select>
                        ) : (
                          todo.userId ? (
                            users?.find(user => user.id === todo.userId)?.name || 'Usuario desconocido'
                          ) : 'Sin asignar'
                        )}
                      </td>
                      <td>
                        {formatDate(todo.createdAt)}
                      </td>
                      <td>
                        {editingTodo && editingTodo.id === todo.id ? (
                          <EditActionButtons
                            onSave={handleUpdateTodo}
                            onCancel={cancelEditing}
                            disabled={isLoading}
                            isLoading={isLoading}
                          />
                        ) : (
                          <TableActionButtons
                            onEdit={() => startEditing(todo.id, todo.title)}
                            onDelete={() => deleteTodo(todo.id)}
                            disableDelete={isLoading}
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </>
      )}
    </Container>
  );
}