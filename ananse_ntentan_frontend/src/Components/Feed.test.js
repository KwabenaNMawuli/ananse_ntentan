import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Feed from './Feed';

// Mock fetch globally
global.fetch = jest.fn();

// Sample test data
const mockStory = {
  _id: '507f1f77bcf86cd799439011',
  type: 'personal',
  metadata: { likes: 5 },
  visualNarrative: {
    panels: [
      {
        number: 1,
        dialogue: 'They said the sky would tear itself apart when he arrived.',
        scene: 'A storm-battered kingdom under siege',
        imageFileId: '507f1f77bcf86cd799439012'
      }
    ]
  }
};

const mockApiResponse = {
  success: true,
  stories: [mockStory],
  pagination: { pages: 1 }
};

describe('Feed Component', () => {
  beforeEach(() => {
    // Reset fetch mock before each test
    fetch.mockClear();
  });

  // Test 1: Should show loading state initially
  test('displays loading state while fetching stories', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    render(<Feed />);
    
    expect(screen.getByText(/Receiving Transmissions.../i)).toBeInTheDocument();
  });

  // Test 2: Should display stories after successful fetch
  test('displays stories after successful API call', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/PERSONAL TRANSMISSION/i)).toBeInTheDocument();
    });
  });

  // Test 3: Should display error message on API failure
  test('displays error message when API fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/Error connecting to server/i)).toBeInTheDocument();
    });
  });

  // Test 4: Should display story ID correctly
  test('displays shortened story ID', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<Feed />);

    await waitFor(() => {
      // Last 6 characters of _id: 439011
      expect(screen.getByText(/Story #439011/i)).toBeInTheDocument();
    });
  });

  // Test 5: Should display panel dialogue
  test('displays panel dialogue correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/They said the sky would tear itself apart/i)).toBeInTheDocument();
    });
  });

  // Test 6: Should display panel scene description
  test('displays panel scene description', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/A storm-battered kingdom under siege/i)).toBeInTheDocument();
    });
  });

  // Test 7: Should handle like button click
  test('increments like count when like button is clicked', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });
    
    // Mock the like API call
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true })
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/5 Likes/i)).toBeInTheDocument();
    });

    // Find and click the like button
    const likeButton = screen.getByRole('button', { name: /likes/i });
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByText(/6 Likes/i)).toBeInTheDocument();
    });
  });

  // Test 8: Should display Return to Home link
  test('displays return to home link', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve(mockApiResponse)
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/Return to Home/i)).toBeInTheDocument();
    });
  });

  // Test 9: Should handle empty stories array
  test('handles empty stories array', async () => {
    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        stories: [],
        pagination: { pages: 0 }
      })
    });

    render(<Feed />);

    await waitFor(() => {
      // Should not show loading anymore
      expect(screen.queryByText(/Receiving Transmissions.../i)).not.toBeInTheDocument();
    });
  });

  // Test 10: Should handle stories without panels
  test('handles story without visual panels', async () => {
    const storyWithoutPanels = {
      ...mockStory,
      visualNarrative: { panels: [] },
      originalContent: { text: 'Original story text here' }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        stories: [storyWithoutPanels],
        pagination: { pages: 1 }
      })
    });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText(/No visual panels generated/i)).toBeInTheDocument();
    });
  });
});

// Security-focused tests
describe('Feed Component - Security', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Test: Should sanitize potentially malicious content
  test('should not execute script tags in dialogue', async () => {
    const maliciousStory = {
      ...mockStory,
      visualNarrative: {
        panels: [{
          number: 1,
          dialogue: '<script>alert("xss")</script>',
          scene: 'Test scene'
        }]
      }
    };

    fetch.mockResolvedValueOnce({
      json: () => Promise.resolve({
        success: true,
        stories: [maliciousStory],
        pagination: { pages: 1 }
      })
    });

    render(<Feed />);

    await waitFor(() => {
      // React automatically escapes, so the script should be rendered as text, not executed
      expect(screen.getByText(/alert/i)).toBeInTheDocument();
    });
  });
});
