/**
 * Componente de menú de navegación principal
 * Proporciona accesos a las secciones principales de la aplicación
 * - Configuración de fuentes de datos
 * - Gestión de usuarios
 * - Administración de tareas
 */
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Container, Nav } from 'react-bootstrap';

export function NavMenu() {
  const location = useLocation();

  // Verificar qué ruta está activa
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path === '/users' && (location.pathname === '/users' || location.pathname.startsWith('/users/'))) return true;
    if (path === '/datasources' && location.pathname === '/datasources') return true;
    if (path === '/todos' && location.pathname === '/todos') return true;
    return false;
  };

  return (
    <Navbar bg="primary" variant="dark" expand="lg" fixed="top" className="mb-4">
      <Container>
        <Navbar.Brand>Data Manager</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/datasources" active={isActive('/datasources')}>
              Fuentes de Datos
            </Nav.Link>
            <Nav.Link as={Link} to="/users" active={isActive('/users')}>
              Usuarios
            </Nav.Link>
            <Nav.Link as={Link} to="/todos" active={isActive('/todos')}>
              Tareas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}