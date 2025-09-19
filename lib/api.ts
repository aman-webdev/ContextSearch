// Utility functions for authenticated API calls

export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  // Get token from localStorage
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  // Add Authorization header to existing headers
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('Content-Type', 'application/json');

  // Make the request with auth header
  const response = await fetch(url, {
    ...options,
    headers
  });

  // Handle auth errors
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));

    // Check if it's an expired token
    if (errorData.expired) {
      console.log('Token expired, getting fresh token...');
      localStorage.removeItem('authToken');

      try {
        // Try to get a fresh token
        const meResponse = await fetch('/api/me');
        const meData = await meResponse.json();

        if (meResponse.ok && meData.data) {
          // Store new token
          localStorage.setItem('authToken', meData.data);

          // Retry the original request with new token
          const retryHeaders = new Headers(options.headers);
          retryHeaders.set('Authorization', `Bearer ${meData.data}`);

          return fetch(url, {
            ...options,
            headers: retryHeaders
          });
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
      }
    }

    // If we can't refresh or it's not expired, clear token and throw error
    localStorage.removeItem('authToken');
    throw new Error('Authentication failed. Please refresh the page.');
  }

  return response;
}

// Helper for GET requests
export async function authenticatedGet(url: string) {
  return authenticatedFetch(url, {
    method: 'GET'
  });
}

// Helper for POST requests
export async function authenticatedPost(url: string, data?: any) {
  return authenticatedFetch(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined
  });
}

// Helper for FormData uploads (doesn't set Content-Type, lets browser handle it)
export async function authenticatedFormData(url: string, formData: FormData) {
  const token = localStorage.getItem('authToken');

  if (!token) {
    throw new Error('No authentication token found');
  }

  // For FormData, don't set Content-Type (let browser set multipart boundary)
  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData
  });

  if (response.status === 401) {
    localStorage.removeItem('authToken');
    throw new Error('Authentication failed. Please refresh the page.');
  }

  return response;
}