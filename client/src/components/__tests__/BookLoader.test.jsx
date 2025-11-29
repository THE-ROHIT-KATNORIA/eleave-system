import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import BookLoader from '../BookLoader';

describe('BookLoader Component', () => {
  it('renders book loader wrapper', () => {
    const { container } = render(<BookLoader />);
    expect(container.querySelector('.book-loader-wrapper')).toBeInTheDocument();
  });

  it('renders book element', () => {
    const { container } = render(<BookLoader />);
    expect(container.querySelector('.book')).toBeInTheDocument();
  });

  it('renders all book pages', () => {
    const { container } = render(<BookLoader />);
    const pages = container.querySelectorAll('.book__pg');
    expect(pages.length).toBeGreaterThan(0);
  });
});
