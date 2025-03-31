/**
 * Componente para mostrar la lista de usuarios
 * Permite crear, editar, eliminar y seleccionar usuarios
 * Implementa funcionalidades de ordenamiento y filtrado similar a TodoList
 */
import { useEffect, useState } from 'react';
// Remove unused Link import since it's not being used in the component
import { Container, Table, Button, Form, Card, Row, Col, Alert, Spinner, Badge, InputGroup } from 'react-bootstrap';
import { useUserStore } from '../application/store/userStore';
import { CreateUserInput, UpdateUserInput, User } from '../domain/models/User';

export function UserList() {
  const { 
    users, 
    selectedUser,
    isLoading, 
    error, 
    fetchUsers, 
    addUser, 
    updateUser, 
    deleteUser,
    selectUser 
  } = useUserStore();

  // Estado para el formulario de nuevo usuario
  const [newUserData, setNewUserData] = useState({ name: '', email: '' });
  // Estado para el usuario en edición
  const [editingUser, setEditingUser] = useState<{ id: string; name: string; email: string } | null>(null);
  // Estados para ordenación y filtrado
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterText, setFilterText] = useState('');

  // Cargar los usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejar creación de nuevo usuario
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUserData.name.trim() && newUserData.email.trim()) {
      const newUser: CreateUserInput = {
        name: newUserData.name.trim(),
        email: newUserData.email.trim()
      };
      addUser(newUser);
      setNewUserData({ name: '', email: '' });
    }
  };

  // Manejar actualización de usuario
  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser && editingUser.name.trim() && editingUser.email.trim()) {
      const userUpdate: UpdateUserInput = {
        id: parseInt(editingUser.id),
        name: editingUser.name.trim(),
        email: editingUser.email.trim()
      };
      updateUser(userUpdate);
      setEditingUser(null);
    }
  };

  // Ordenar usuarios
  const handleSort = (field: keyof User) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Iniciar edición de un usuario
  const startEditing = (id: string, name: string, email: string) => {
    setEditingUser({ id, name, email });
  };

  // Cancelar edición de un usuario
  const cancelEditing = () => {
    setEditingUser(null);
  };

  // Formatear fecha, asegurándose que sea un objeto Date válido
  const formatDate = (date: Date | string) => {
    const dateObject = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat('es', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObject);
  };
  
  // Obtener el ícono para la columna ordenada
  const getSortIcon = (field: keyof User) => {
    if (field !== sortField) return '';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  // Obtener usuarios filtrados y ordenados
  const getSortedAndFilteredUsers = () => {
    return [...users]
      .filter(user => 
        user.name.toLowerCase().includes(filterText.toLowerCase()) ||
        user.email.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => {
        if (sortField === 'createdAt') {
          const aValue = a[sortField] instanceof Date ? a[sortField] as Date : new Date(a[sortField]);
          const bValue = b[sortField] instanceof Date ? b[sortField] as Date : new Date(b[sortField]);
          return sortDirection === 'asc' 
            ? aValue.getTime() - bValue.getTime() 
            : bValue.getTime() - aValue.getTime();
        } else {
          const aValue = String(a[sortField as keyof User]).toLowerCase();
          const bValue = String(b[sortField as keyof User]).toLowerCase();
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      });
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mb-4">
        <Card.Header as="h2" className="bg-primary text-white text-center py-3">Usuarios</Card.Header>
        <Card.Body>
          {/* Formulario para crear nuevo usuario */}
          <Card className="mb-4">
            <Card.Header as="h5" className="bg-light">Crear Nuevo Usuario</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateUser}>
                <Row className="g-3">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Nombre"
                      value={newUserData.name}
                      onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                      disabled={isLoading}
                    />
                  </Col>
                  <Col md={5}>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={newUserData.email}
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                      disabled={isLoading}
                    />
                  </Col>
                  <Col md={2}>
                    <Button 
                      type="submit" 
                      variant="success" 
                      className="w-100"
                      disabled={isLoading || !newUserData.name.trim() || !newUserData.email.trim()}
                    >
                      <i className="bi bi-plus-circle me-2"></i>Crear
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          {/* Búsqueda y filtrado */}
          <Row className="mb-4">
            <Col md={6} className="ms-auto">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Buscar usuarios..."
                />
              </InputGroup>
            </Col>
          </Row>
          
          {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Formulario para editar un usuario */}
      {editingUser && (
        <Card className="mb-4">
          <Card.Header as="h5" className="bg-light">Editar Usuario</Card.Header>
          <Card.Body>
            <Form onSubmit={handleUpdateUser}>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group controlId="editingName">
                    <Form.Label>Nombre</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nombre"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editingEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} className="text-center mt-3">
                  <Button 
                    type="submit" 
                    variant="success" 
                    className="me-2"
                    disabled={isLoading || !editingUser.name.trim() || !editingUser.email.trim()}
                  >
                    Guardar
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={cancelEditing} 
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}
      
      {/* Indicador de carga */}
      {isLoading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando usuarios...</p>
        </div>
      ) : (
        <>
          {/* Tabla de usuarios */}
          <Table responsive striped bordered hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th onClick={() => handleSort('id')} style={{cursor: 'pointer'}}>
                  ID {getSortIcon('id')}
                </th>
                <th onClick={() => handleSort('name')} style={{cursor: 'pointer'}}>
                  Nombre {getSortIcon('name')}
                </th>
                <th onClick={() => handleSort('email')} style={{cursor: 'pointer'}}>
                  Email {getSortIcon('email')}
                </th>
                <th onClick={() => handleSort('createdAt')} style={{cursor: 'pointer'}}>
                  Fecha Creación {getSortIcon('createdAt')}
                </th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
          <tbody>
            {getSortedAndFilteredUsers().map(user => (
              <tr key={user.id} className={selectedUser?.id === user.id ? 'table-primary' : ''}>
                <td><Badge bg="secondary">{user.id}</Badge></td>
                <td>
                  {editingUser && parseInt(editingUser.id) === user.id ? (
                    <Form.Control
                      type="text"
                      value={editingUser.name}
                      onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                      size="sm"
                    />
                  ) : (
                    <span>{user.name}</span>
                  )}
                </td>
                <td>
                  {editingUser && parseInt(editingUser.id) === user.id ? (
                    <Form.Control
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      size="sm"
                    />
                  ) : (
                    <span>{user.email}</span>
                  )}
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="d-flex gap-2 justify-content-center">
                    {editingUser && parseInt(editingUser.id) === user.id ? (
                      <>
                        <Button onClick={handleUpdateUser} variant="success" size="sm"><i className="bi bi-check"></i></Button>
                        <Button onClick={cancelEditing} variant="secondary" size="sm"><i className="bi bi-x"></i></Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant={selectedUser?.id === user.id ? "outline-primary" : "primary"}
                          size="sm"
                          onClick={() => selectUser(user.id === selectedUser?.id ? null : user.id)}
                        >
                          {selectedUser?.id === user.id ? 'Deseleccionar' : 'Seleccionar'}
                        </Button>
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => startEditing(String(user.id), user.name, user.email)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => deleteUser(user.id)} 
                          disabled={isLoading}
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          </Table>
      
          {/* Mensaje cuando no hay usuarios */}
          {!isLoading && users.length === 0 && (
            <Alert variant="info" className="text-center mt-4">
              No hay usuarios para mostrar. ¡Crea un nuevo usuario!
            </Alert>
          )}
        </>
      )}
        </Card.Body>
      </Card>
    </Container>
  );
}