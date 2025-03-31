/**
 * Componente para seleccionar la fuente de datos
 * Permite cambiar entre GraphQL y Mock con persistencia local
 */
import { FormEvent, useState } from 'react';
import { Form, Container, Row, Col, Card, ButtonGroup, Alert } from 'react-bootstrap';
import { ActionButton } from './shared/UIComponents';
import { DataSource, useTodoStore } from '../application/store/todoStore';
import { useUserStore } from '../application/store/userStore';
import { MockTodoRepository } from '../infrastructure/adapters/mock/MockTodoRepository';
import { MockUserRepository } from '../infrastructure/adapters/mock/MockUserRepository';

interface DataSourceConfig {
  graphql: {
    uri: string;
  };
}

export function DataSourceSelector() {
  const { dataSource, changeDataSource } = useTodoStore();
  
  // Estado para las configuraciones de las fuentes de datos
  const [config, setConfig] = useState<DataSourceConfig>({
    graphql: {
      uri: 'http://localhost:4000/graphql',
    },
  });

  // Manejar cambio de fuente de datos
  const handleDataSourceChange = (source: DataSource) => {
    if (source === 'graphql') {
      changeDataSource(source, { uri: config.graphql.uri });
    } else {
      changeDataSource(source);
    }
  };

  // Manejar cambio de configuración de GraphQL
  const handleGraphQLConfigSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (dataSource === 'graphql') {
      changeDataSource('graphql', { uri: config.graphql.uri });
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm">
        <Card.Header as="h2" className="text-center bg-primary text-white py-3">Fuente de datos</Card.Header>
        <Card.Body>
          <Row className="justify-content-center mb-4">
            <Col md={6}>
              <ButtonGroup className="w-100">
                <ActionButton 
                  variant={dataSource === 'graphql' ? 'primary' : 'outline-primary'}
                  onClick={() => handleDataSourceChange('graphql')}
                >
                  GraphQL
                </ActionButton>
                <ActionButton 
                  variant={dataSource === 'mock' ? 'primary' : 'outline-primary'}
                  onClick={() => handleDataSourceChange('mock')}
                >
                  Mock
                </ActionButton>
              </ButtonGroup>
            </Col>
          </Row>

      {/* Configuración de GraphQL */}
      {dataSource === 'graphql' && (
        <Row className="justify-content-center">
          <Col md={1000} lg={800}>
            <Card className="mt-3">
              <Card.Header as="h5" className="bg-light">Configuración GraphQL</Card.Header>
              <Card.Body>
                <Form onSubmit={handleGraphQLConfigSubmit}>
                  <Form.Group className="mb-3" controlId="graphqlUri">
                    <Form.Label>URI:</Form.Label>
                    <Form.Control 
                      type="text" 
                      className="w-100"
                      value={config.graphql.uri}
                      onChange={(e) => setConfig({
                        ...config,
                        graphql: { ...config.graphql, uri: e.target.value }
                      })}
                    />
                  </Form.Group>
                  <div className="text-center">
                    <ActionButton type="submit" variant="primary">Actualizar</ActionButton>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Información de Mock */}
      {dataSource === 'mock' && (
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="mt-3">
              <Card.Header as="h5" className="bg-light">Datos de prueba</Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-3">
                  Usando datos de prueba con persistencia en localStorage. Los datos se mantendrán disponibles entre recargas del navegador.
                </Alert>
                <div className="text-center d-flex justify-content-center gap-3">
                  <ActionButton 
                    variant="success"
                    onClick={() => {
                      // Llenamos ambos repositorios con datos de ejemplo
                      const todoStore = useTodoStore.getState();
                      const userStore = useUserStore.getState();
                      
                      // Asumimos que los repositories son instancias de MockRepository
                      const mockTodoRepo = todoStore.repository as MockTodoRepository;
                      mockTodoRepo.fillWithSampleData();
                      todoStore.fetchTodos();
                      
                      // También llenamos el repositorio de usuarios
                      const mockUserRepo = userStore.repository as MockUserRepository;
                      mockUserRepo.fillWithSampleData();
                      userStore.fetchUsers();
                    }}
                  >
                    Llenar con datos de ejemplo
                  </ActionButton>
                  <ActionButton 
                    variant="warning"
                    onClick={() => {
                      // Primero limpiamos completamente los datos del localStorage
                      localStorage.removeItem('mock_todos');
                      localStorage.removeItem('mock_users');
                      
                      // Obtenemos los stores
                      const todoStore = useTodoStore.getState();
                      const userStore = useUserStore.getState();
                      
                      // Reiniciamos los repositorios sin generar datos automáticamente
                      todoStore.changeDataSource('mock', { initialTodos: [] });
                      userStore.changeDataSource('mock', { initialUsers: [] });
                      
                      // Recargamos los todos y usuarios para reflejar el estado vacío
                      todoStore.fetchTodos();
                      userStore.fetchUsers();
                      
                      // Notificamos al usuario que se ha limpiado el almacenamiento
                      alert('Almacenamiento local limpiado correctamente');
                    }}
                  >
                    Limpiar almacenamiento local
                  </ActionButton>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
        </Card.Body>
      </Card>
    </Container>
  );
}