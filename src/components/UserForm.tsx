/**
 * Componente para crear y editar usuarios en una página separada
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserStore } from '../application/store/userStore';
import { CreateUserInput, UpdateUserInput } from '../domain/models/User';
import { Form, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { ActionButton, LoadingButton } from './shared/UIComponents';

export function UserForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const { 
    users, 
    isLoading, 
    error, 
    fetchUsers, 
    addUser, 
    updateUser
  } = useUserStore();

  const [userData, setUserData] = useState({ name: '', email: '' });

  // Cargar usuarios si es necesario y configurar el formulario si estamos en modo edición
  useEffect(() => {
    fetchUsers();
    
    // Si estamos en modo edición, cargar los datos del usuario
    if (isEditMode && id) {
      const userToEdit = users.find(user => user.id === parseInt(id));
      if (userToEdit) {
        setUserData({
          name: userToEdit.name,
          email: userToEdit.email
        });
      } else {
        // Si no se encuentra el usuario, redireccionar a la lista
        navigate('/users');
      }
    }
  }, [fetchUsers, id, isEditMode, navigate, users]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userData.name.trim() && userData.email.trim()) {
      try {
        if (isEditMode && id) {
          // Actualizar usuario existente
          const userUpdate: UpdateUserInput = {
            id: parseInt(id),
            name: userData.name.trim(),
            email: userData.email.trim()
          };
          await updateUser(userUpdate);
        } else {
          // Crear nuevo usuario
          const newUser: CreateUserInput = {
            name: userData.name.trim(),
            email: userData.email.trim()
          };
          const createdUser = await addUser(newUser);
          console.log('Usuario creado:', createdUser);
        }
        
        // Redirigir a la lista de usuarios solo cuando la operación se complete
        navigate('/users');
      } catch (error) {
        console.error('Error al guardar usuario:', error);
        // La gestión del error ya se maneja en el store
      }
    }
  };

  // Cancelar y volver a la lista de usuarios
  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <h2 className="mb-4">{isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Nombre:</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                placeholder="Nombre completo"
                disabled={isLoading}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email:</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="Correo electrónico"
                disabled={isLoading}
                required
              />
            </Form.Group>
            
            <div className="d-flex gap-2">
              <LoadingButton 
                onClick={(e) => handleSubmit(e as any)}
                variant="primary" 
                isLoading={isLoading}
                disabled={!userData.name.trim() || !userData.email.trim()}
              >
                {isEditMode ? 'Actualizar' : 'Crear'}
              </LoadingButton>
              <ActionButton 
                variant="secondary" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </ActionButton>
            </div>
          </Form>
          
          {isLoading && (
            <div className="d-flex justify-content-center mt-3">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Cargando...</span>
              </Spinner>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}