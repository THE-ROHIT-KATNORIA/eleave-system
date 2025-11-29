import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChipLoader from '../ChipLoader';

describe('ChipLoader Component', () => {
  it('renders loader without fullscreen by default', () => {
    const { container } = render(<ChipLoader />);
    expect(container.querySelector('.loader')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<ChipLoader message="Loading data..." />);
    // Message is displayed in SVG text or as paragraph in fullscreen
    expect(screen.queryByText(/Loading/i)).toBeTruthy();
  });

  it('renders in fullscreen mode when prop is true', () => {
    render(<ChipLoader fullScreen message="Loading..." />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('displays message only in fullscreen mode', () => {
    const { rerender } = render(<ChipLoader fullScreen={false} message="Test" />);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
    
    rerender(<ChipLoader fullScreen={true} message="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
