import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MainLayout from './MainLayout';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';

// Mock child components
vi.mock('./Sidebar', () => ({
  Sidebar: vi.fn(({ isCollapsed, isMobile }) => (
    <div data-testid={isMobile ? 'mobile-sidebar' : 'desktop-sidebar'} data-collapsed={isCollapsed}>
      Mocked Sidebar
    </div>
  )),
}));

// Mock hooks used by Header
vi.mock('@/lib/store/authStore');
vi.mock('@/hooks/use-toast');

describe('MainLayout Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock implementations for hooks
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null,
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    });
    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: vi.fn(),
    });
  });

  it('renders the Header with the correct title', () => {
    const testTitle = 'Layout Test Title';
    render(
      <MainLayout title={testTitle}>
        <div>Child Content</div>
      </MainLayout>
    );

    // Header component renders the title in an h1
    expect(screen.getByRole('heading', { name: testTitle, level: 1 })).toBeInTheDocument();
  });

  it('renders its children', () => {
    const testTitle = 'Layout Test';
    const childText = 'This is the main content';
    render(
      <MainLayout title={testTitle}>
        <p>{childText}</p>
      </MainLayout>
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('renders the mocked Sidebar components', () => {
     const testTitle = 'Layout Test';
     render(
       <MainLayout title={testTitle}>
         <div>Child Content</div>
       </MainLayout>
     );

     // Check for both desktop and mobile (mocked) sidebars
     expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
     // Mobile sidebar is initially hidden but present in the DOM
     expect(screen.getByTestId('mobile-sidebar')).toBeInTheDocument();
   });

  // Add more tests for sidebar toggling interactions later if needed
});