# Frontend Authentication Flow

## Problem Solved

When the backend server is not running, the frontend previously displayed pages without login because it only checked if a token existed in localStorage, without validating if the token is actually valid or the backend is accessible.

## Solution

### Components Added

1. **AuthProvider** (`src/components/AuthProvider.tsx`)
   - Wraps the entire application
   - On mount, validates the token with the backend
   - Redirects to `/login` if:
     - No token exists
     - Token is invalid (backend validation fails)
     - Backend is unreachable
   - Prevents rendering of protected content until auth is verified

2. **Auth Helper Functions** (`src/lib/auth.ts`)
   - `validateToken(token)` - Calls `/api/auth/me` to verify token validity
   - `getToken()` - Retrieves token from localStorage
   - `setToken()` - Saves token to localStorage
   - `getUser()` - Retrieves user info from localStorage
   - `setUser()` - Saves user info to localStorage
   - `clearAuth()` - Removes all auth data

3. **API Fetch Helper** (`src/lib/api.ts`)
   - `apiFetch()` - Makes authenticated HTTP requests
   - Automatically adds Authorization header with token
   - On 401 response, clears auth and redirects to login
   - Useful for enforcing auth on API errors

## Updated Components

1. **MainWrapper** - Simplified to only handle layout
2. **Sidebar** - Uses auth helper functions instead of direct localStorage access
3. **Login Page** - Uses auth helper functions for storing credentials
4. **Layout** - Wraps everything with AuthProvider

## Flow

```
User visits app
    ↓
AuthProvider mounts
    ↓
Check if token exists
    ├─ No token → Redirect to /login
    └─ Token exists → Validate with backend
        ├─ Backend down/unreachable → Redirect to /login
        ├─ Token invalid (401) → Clear auth → Redirect to /login
        └─ Token valid → Show protected content

API calls return 401
    ↓
apiFetch helper catches error
    ↓
Clear auth & redirect to /login
```

## Usage

### Making Authenticated Requests

```typescript
import { apiFetch } from "@/lib/api";

const response = await apiFetch("/api/devices", {
  method: "GET",
});
```

### Checking Auth Status

```typescript
import { getToken, getUser } from "@/lib/auth";

const token = getToken();
const user = getUser();
```

### Logout

```typescript
import { clearAuth } from "@/lib/auth";

clearAuth(); // Clears all auth data
// Then redirect to login
```
