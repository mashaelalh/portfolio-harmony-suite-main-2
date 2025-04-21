import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest'; // Added beforeEach
import Header from './Header';
import { useAuthStore } from '@/lib/store/authStore';
import { useToast } from '@/hooks/use-toast';

// Mock the Zustand store
vi.mock('@/lib/store/authStore');

// Mock the useToast hook
vi.mock('@/hooks/use-toast');

describe('Header Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Provide default mock implementations
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: null, // Default to no user logged in
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    });

    (useToast as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: vi.fn(),
    });
  });

  it('renders the title correctly', () => {
    const testTitle = 'Test Dashboard';
    render(<Header title={testTitle} />);

    // Check if the title is displayed
    expect(screen.getByRole('heading', { name: testTitle })).toBeInTheDocument();
  });

  it('renders children when provided', () => {
    const testTitle = 'Test Page';
    const childText = 'Child Content';
    render(
      <Header title={testTitle}>
        <span>{childText}</span>
      </Header>
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
  });

  it('displays user role badge when user is logged in', () => {
    const testTitle = 'Admin Page';
    // Mock user as logged in (e.g., admin)
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', email: 'admin@example.com', role: 'admin' },
      setUser: vi.fn(),
      clearAuth: vi.fn(),
    });

    render(<Header title={testTitle} />);

    // Check for the badge text (adjust based on actual badge content)
    // Using text matching as role might not be directly accessible
    expect(screen.getByText('Administrator')).toBeInTheDocument();
  });

  // Add more tests for search, notifications, help link, mobile dropdown etc.
});