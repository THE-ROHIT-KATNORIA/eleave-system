import { Component } from 'react';

/**
 * Detect WebGL support in the browser
 */
const detectWebGLSupport = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

/**
 * 2D Fallback UI component when 3D rendering fails
 */
const Fallback2D = ({ message, onRetry }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </div>
    <h3 style={{ color: '#1e293b', marginBottom: '8px', fontSize: '18px' }}>
      3D Rendering Unavailable
    </h3>
    <p style={{ color: '#64748b', marginBottom: '20px', maxWidth: '400px' }}>
      {message || 'Your browser does not support 3D graphics. The application will continue with a simplified interface.'}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
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
        Retry
      </button>
    )}
  </div>
);

/**
 * Error Boundary specifically for Three.js/3D components
 * Provides graceful degradation to 2D UI when 3D rendering fails
 * Includes WebGL support detection
 */
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      webGLSupported: true,
    };
  }

  componentDidMount() {
    // Check WebGL support on mount
    const supported = detectWebGLSupport();
    if (!supported) {
      this.setState({ 
        hasError: true, 
        webGLSupported: false,
        error: new Error('WebGL not supported')
      });
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ThreeErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine error message
      let message = 'Unable to render 3D graphics.';
      if (!this.state.webGLSupported) {
        message = 'Your browser does not support WebGL, which is required for 3D graphics. Please try a modern browser like Chrome, Firefox, or Edge.';
      } else if (this.state.error) {
        message = 'An error occurred while rendering 3D content. The application will continue with a simplified interface.';
      }

      // Show 2D fallback
      return (
        <Fallback2D 
          message={message} 
          onRetry={this.state.webGLSupported ? this.handleRetry : null}
        />
      );
    }

    return this.props.children;
  }
}

export { ThreeErrorBoundary, detectWebGLSupport, Fallback2D };
export default ThreeErrorBoundary;
