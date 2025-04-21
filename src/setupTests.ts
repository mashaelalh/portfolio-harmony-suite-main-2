// Vitest setup file
import '@testing-library/jest-dom/vitest'; // Import the matchers
import * as matchers from '@testing-library/jest-dom/matchers'; // Import all matchers
import { expect } from 'vitest'; // Import expect from vitest

console.log('Vitest setup file loaded.');

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia for components that use it (like Sonner)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated
    removeListener: () => {}, // Deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});