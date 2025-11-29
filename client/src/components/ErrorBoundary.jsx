import { Component } from 'react';

/**
 * Error Boundary component to catch and handle React errors
 * Provides fallback UI when errors occur in child components
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {this.props.errorMessage || 'An unexpected error occurred. Please try again.'}
          </p>
          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '24px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#64748b' }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  marginTop: '12px',
                  padding: '12px',
                  backgroundColor: '#1e293b',
                  color: '#f1f5f9',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
