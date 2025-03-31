/**
 * Componente principal de la aplicación
 * Integra el menú de navegación y los componentes principales
 */
import './App.css'
import { BrowserRouter as Router } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { Routes } from './components/Routes'
import { NavMenu } from './components/NavMenu'

function App() {
  return (
    <Router>
        <div className="d-flex flex-column min-vh-100">
          <NavMenu />

          <Container className="py-5 flex-grow-1">
            <Routes />
          </Container>

          <footer className="py-3 bg-light text-center">
            <Container>
              <p className="text-muted mb-0">
                Implementado con React, TypeScript, SWR, Zustand y Patrón de Repositorio
              </p>
            </Container>
          </footer>
        </div>
      </Router>
  )
}

export default App
