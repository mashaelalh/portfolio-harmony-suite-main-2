import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom'; // Needed for NavLink/useLocation
import { Sidebar } from './Sidebar'; // Assuming named export
import { useAuthStore } from '@/lib/store/authStore';

// Mock the Zustand store
vi.mock('@/lib/store/authStore');

describe('Sidebar Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();

    // Provide default mock implementations
    (useAuthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      user: { id: '1', email: 'test@example.com', role: 'pm' }, // Mock a logged-in user
      setUser: vi.fn(),
      clearAuth: vi.fn(),
      logout: vi.fn(), // Mock the logout function
    });
  });

  const renderWithRouter = (ui: React.ReactElement, { route = '/' } = {}) => {
    window.history.pushState({}, 'Test page', route);
    return render(ui, { wrapper: MemoryRouter });
  };

  it('renders navigation links when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} />);

    // Check for some navigation links by their text
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Portfolios')).toBeInTheDocument();
    expect(screen.getByText('Executive Report')).toBeInTheDocument();
  });

  it('renders only icons when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} />);

    // Check that text links are NOT present
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Projects')).not.toBeInTheDocument();

    // Check for the presence of link elements (icons should still be there)
    // Assuming NavLink renders an 'a' tag
    const links = screen.getAllByRole('link');
    // Expecting links for logo, nav items, settings
    expect(links.length).toBeGreaterThanOrEqual(5); // Logo + 4 nav items + settings link
  });

  it('renders Settings and Logout buttons when expanded', () => {
    renderWithRouter(<Sidebar isCollapsed={false} />);
    // Use getByRole for more specific targeting
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

   it('renders only Settings and Logout icons when collapsed', () => {
    renderWithRouter(<Sidebar isCollapsed={true} />);
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();

    // Check for the link and button presence without relying on visible text name
    // Settings is a link with href="/settings"
    // Find the specific link by its href attribute among all links
    const settingsLink = screen.getAllByRole('link').find(link => link.getAttribute('href') === '/settings');
    expect(settingsLink).toBeInTheDocument(); // Ensure the link element is found

    // Logout is a button (assuming it's the only button in this collapsed desktop state)
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // Add tests for mobile view, toggle/close functions later if needed
});