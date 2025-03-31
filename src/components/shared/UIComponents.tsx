/**
 * Componentes UI compartidos para toda la aplicación
 * Este archivo contiene componentes reutilizables para mantener consistencia
 * visual y reducir la duplicación de código
 */
import React from 'react';
import { Button, Spinner, InputGroup, Form } from 'react-bootstrap';

interface ActionButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant: string;
  size?: 'sm' | 'lg';
  disabled?: boolean;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Botón estandarizado para acciones
 * Asegura consistencia visual en toda la aplicación
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  variant,
  size,
  disabled = false,
  icon,
  children,
  className = '',
  active,
  type = 'button',
}) => {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      className={className}
      active={active}
      type={type}
    >
      {icon && <i className={`bi bi-${icon} ${children ? 'me-1' : ''}`}></i>}
      {children}
    </Button>
  );
};

interface LoadingButtonProps extends Omit<ActionButtonProps, 'onClick'> {
  onClick: (e: React.MouseEvent<HTMLButtonElement> | React.FormEvent) => void;
  isLoading: boolean;
  loadingText?: string;
}

/**
 * Botón con estado de carga
 * Muestra un spinner cuando está en proceso de carga
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  onClick,
  variant,
  size,
  disabled = false,
  icon,
  children,
  isLoading,
  loadingText,
  className = '',
}) => {
  return (
    <Button
      onClick={(e) => onClick(e)}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          <span className="ms-2">{loadingText || 'Cargando...'}</span>
        </>
      ) : (
        <>
          {icon && <i className={`bi bi-${icon} ${children ? 'me-1' : ''}`}></i>}
          {children}
        </>
      )}
    </Button>
  );
};

interface SearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onClear?: () => void;
  disabled?: boolean;
}

/**
 * Campo de búsqueda estandarizado
 * Incluye un ícono de búsqueda consistente
 */
export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder = 'Buscar...', onClear, disabled = false }) => {
  return (
    <InputGroup>
      <InputGroup.Text>
        <i className="bi bi-search"></i>
      </InputGroup.Text>
      <Form.Control
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {onClear && value && (
        <Button variant="outline-secondary" onClick={onClear} disabled={disabled}>
          <i className="bi bi-x"></i>
        </Button>
      )}
    </InputGroup>
  );
};

/**
 * Botones de acciones para tablas
 * Conjunto estandarizado de botones para editar y eliminar
 */
interface TableActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  disableDelete?: boolean;
}

export const TableActionButtons: React.FC<TableActionButtonsProps> = ({ 
  onEdit, 
  onDelete,
  disableDelete = false
}) => {
  return (
    <div className="d-flex gap-2 justify-content-center">
      <ActionButton 
        onClick={onEdit} 
        variant="outline-primary" 
        size="sm"
      >
        Editar
      </ActionButton>
      <ActionButton 
        onClick={onDelete} 
        variant="outline-danger" 
        size="sm"
        disabled={disableDelete}
      >
        Eliminar
      </ActionButton>
    </div>
  );
};

/**
 * Botones para confirmación/cancelación de edición
 */
interface EditActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export const EditActionButtons: React.FC<EditActionButtonsProps> = ({ 
  onSave, 
  onCancel,
  disabled = false,
  isLoading = false
}) => {
  return (
    <div className="d-flex gap-2 justify-content-center">
      <LoadingButton 
        onClick={onSave} 
        variant="success" 
        size="sm"
        icon="check"
        disabled={disabled}
        isLoading={isLoading}
        loadingText="Guardando..."
      >
        Guardar
      </LoadingButton>
      <ActionButton 
        onClick={onCancel} 
        variant="secondary" 
        size="sm"
        icon="x"
        disabled={isLoading}
      >
        Cancelar
      </ActionButton>
    </div>
  );
};