import React, { Component, ReactNode } from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
`;

const ErrorTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--error-color);
`;

const ErrorMessage = styled.p`
  font-size: 16px;
  margin-bottom: 24px;
  text-align: center;
  max-width: 600px;
  line-height: 1.5;
  color: var(--text-secondary);
`;

const ErrorDetails = styled.pre`
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  max-width: 800px;
  overflow-x: auto;
  font-size: 12px;
  color: var(--text-tertiary);
  border: 1px solid var(--border-color);
`;

const ReloadButton = styled.button`
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--accent-dark);
    transform: translateY(-1px);
  }
`;

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>Oops! Something went wrong</ErrorTitle>
          <ErrorMessage>
            The editor encountered an unexpected error. This might be a temporary issue.
            Try reloading the application to continue.
          </ErrorMessage>
          
          <ReloadButton onClick={this.handleReload}>
            Reload Application
          </ReloadButton>
          
          {this.state.error && (
            <ErrorDetails>
              {this.state.error.toString()}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;