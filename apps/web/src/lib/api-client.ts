import { 
  MOCK_EXPENSES, 
  MOCK_SETTLEMENTS, 
  MOCK_CHORES, 
  MOCK_ANALYTICS, 
  MOCK_BILLS, 
  MOCK_PAYMENTS, 
  MOCK_APARTMENTS 
} from './mock-data';

// Simple pub/sub for demo mode state
let demoModeActive = false;
const listeners = new Set<(active: boolean) => void>();

export const getIsDemoMode = () => demoModeActive;

export const subscribeToDemoMode = (callback: (active: boolean) => void) => {
  listeners.add(callback);
  callback(demoModeActive);
  return () => listeners.delete(callback);
};

const activateDemoMode = () => {
  if (!demoModeActive) {
    console.warn("API Offline. Fallback to DEMO MODE activated.");
    demoModeActive = true;
    listeners.forEach(cb => cb(true));
  }
};

export async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.toString();

  // If we are already in demo mode, skip the network request entirely for GET requests
  // For POST/PUT/DELETE, we just mock a success response to keep the UI from breaking.
  if (demoModeActive) {
    return handleMockResponse(url, init);
  }

  try {
    const response = await fetch(input, init);
    
    // Check if the backend gracefully told us the database is offline
    if (response.status === 503) {
      const data = await response.clone().json().catch(() => ({}));
      if (data?.code === 'DATABASE_OFFLINE') {
        activateDemoMode();
        return handleMockResponse(url, init);
      }
    }

    return response;
  } catch (error) {
    // Network error (e.g. backend server completely down/unreachable)
    activateDemoMode();
    return handleMockResponse(url, init);
  }
}

async function handleMockResponse(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  
  if (method !== 'GET') {
    // Mock success for mutations so the UI continues working smoothly in demo
    return new Response(JSON.stringify({ success: true, mocked: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  let data: any = {};

  if (url.includes('/expenses/default') || url.includes('/expenses/roommates/default') || url.includes('/expenses')) {
    data = MOCK_EXPENSES;
  } else if (url.includes('/settlements/default')) {
    data = MOCK_SETTLEMENTS;
  } else if (url.includes('/chores/default') || url.includes('/chores')) {
    data = MOCK_CHORES;
  } else if (url.includes('/analytics/summary')) {
    data = MOCK_ANALYTICS;
  } else if (url.includes('/apartments')) {
    data = MOCK_APARTMENTS;
  } else if (url.includes('/billing/status')) {
    data = { plan: 'FREE' };
  } else if (url.includes('/payments/default') || url.includes('/payments')) {
    data = MOCK_PAYMENTS;
  } else if (url.includes('/bills/default')) {
    data = MOCK_BILLS;
  }

  // Simulate network delay for realism
  await new Promise(resolve => setTimeout(resolve, 300));

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
