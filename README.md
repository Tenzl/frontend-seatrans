
  # Seatrans Redesign

  Next.js 14 frontend for the Seatrans marketing site and admin console.

  ## Quick start
  - Use Node.js 18+ and npm.
  - Install dependencies: `npm install`.
  - Create `.env.local` using the variables below.
  - Start dev server: `npm run dev`.
  - Production build: `npm run build` then `npm run start`.
  - Lint: `npm run lint`.

  ## Environment variables
  Create `.env.local` at the project root. These values power the centralized API layer and integrations.

  | Name | Required | Example | Notes |
  | --- | --- | --- | --- |
  | API_PROXY_TARGET | Yes (production) | https://api.seatrans.com | Server-side backend origin. Browser requests use the same-origin `/api/*` proxy. |
  | NEXT_PUBLIC_API_BASE_URL | No | / | Leave unset for the proxy setup. An absolute backend URL remains supported for older direct-API deployments. |
  | NEXT_PUBLIC_API_TIMEOUT | No | 30000 | Request timeout in ms. Defaults to 30000. |
  | NEXT_PUBLIC_ENABLE_API_LOGS | No | false | Enable verbose request/response logging in the browser console. |
  | NEXT_PUBLIC_GOOGLE_CLIENT_ID | Yes (for Google OAuth) | your-client-id.apps.googleusercontent.com | Required for Google login flows. |

  Example `.env.local`:

  ```env
  API_PROXY_TARGET=https://api.seatrans.com
  NEXT_PUBLIC_API_TIMEOUT=30000
  NEXT_PUBLIC_ENABLE_API_LOGS=false
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
  ```

  ## API layer
  - Endpoints live in `src/shared/config/api.config.ts`. The browser defaults to `/api/v1`; no public backend variable is required. Server requests use `src/shared/config/server-api.config.ts` and `API_PROXY_TARGET`. Production builds still require an explicit backend target.
  - `src/shared/utils/apiClient.ts` is the shared fetch wrapper that applies the base URL, optional timeout, auth token injection, and optional logging. Set `skipAuth: true` for public calls and pass `FormData` bodies without setting headers manually.
  - Typical usage:

  ```typescript
  import { API_CONFIG } from '@/shared/config/api.config'
  import { apiClient } from '@/shared/utils/apiClient'

  const response = await apiClient.get(API_CONFIG.PROVINCES.ACTIVE)
  const data = await response.json()
  ```

  For deeper guidance, see `FRONTEND_API_STANDARDIZATION_GUIDE.md` in the project root.

