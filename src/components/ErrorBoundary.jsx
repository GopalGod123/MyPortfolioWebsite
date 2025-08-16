import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.primary}20;
  padding: 20px;
`;

const ErrorTitle = styled.h2`
  color: ${({ theme }) => theme.text_primary};
  margin-bottom: 10px;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.text_secondary};
  text-align: center;
  max-width: 400px;
`;

const FallbackComponent = ({ error, resetError }) => (
  <ErrorContainer>
    <ErrorTitle>3D Model Unavailable</ErrorTitle>
    <ErrorMessage>
      The 3D component couldn't be loaded. This might be due to browser compatibility or model loading issues.
    </ErrorMessage>
    {resetError && (
      <button 
        onClick={resetError}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: 'transparent',
          border: '1px solid #306EE8',
          color: '#306EE8',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Try Again
      </button>
    )}
  </ErrorContainer>
);

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('3D Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;