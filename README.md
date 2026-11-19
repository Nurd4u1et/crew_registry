# Crew Registry

React SPA for managing the crew of an orbital station. Built with React, React Router v6, TanStack Query, Firebase Authentication and Vite.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
```

## Environment variables

Create `.env.local` from `.env.example` and fill in the values from your Firebase project (Project settings → Your apps → Web app). `.env.local` is listed in `.gitignore`.

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |

On Vercel add the same variables in Project Settings → Environment Variables and redeploy. Add the deployed domain to Firebase Authentication → Settings → Authorized domains.

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/about` | About |
| `/crew` | Crew list (search, 3 filters, sorting, pagination, all in URL params) |
| `/crew/:id` | Crew member details |
| `/crew/new`, `/crew/:id/edit` | Add / edit form |
| `/dashboard` | Statistics, breakdowns, department filter |
| `/login` | Email/password and Google sign-in |
| `/signup` | Registration with validation and password confirmation |
| `/profile` | Protected page with email, UID and logout |
| `*` | Not found (404) |

## Authentication

- Firebase Authentication with Email/Password and Google providers.
- `AuthProvider` and `useAuth` (`src/context/AuthContext.jsx`) track the user with `onAuthStateChanged` and expose `user`, `loading`, `error`, `signup`, `login`, `loginWithGoogle`, `logout`.
- Sessions persist after refresh (`browserLocalPersistence`); `loading` stays true until Firebase restores the session, so protected routes never redirect too early.
- `ProtectedRoute` redirects unauthenticated users to `/login` and returns them to the page they asked for after login.
- The NavBar shows Login/Signup or Profile/Logout depending on the auth state.
- All Firebase calls live in `src/firebase.js` and `src/services/authService.js`.

## Caching strategy

Server data is cached with TanStack Query. Query keys:

- `["crew", "list", query]` for each combination of search, filters, sorting and page
- `["crew", "detail", id]` for one crew member
- `["crew", "roster"]` for the full roster used by the dashboard

How it works:

- Data stays fresh for 1 minute (`staleTime`). After that it is refetched in the background when a component mounts or the window regains focus.
- Cache entries that nobody uses are removed after 5 minutes (`gcTime`).
- The previous page stays visible while the next one loads (`keepPreviousData`), so pagination and filters do not flash a loader.
- Every response is stored under the key of its own query, so an outdated response can never overwrite a newer one.
- Failed requests are retried once; a failed background refresh keeps the data that is already on screen.

### When cached data is invalidated

After creating, editing, or deleting a crew member, every query whose key starts with `["crew"]` is invalidated (all lists, all details and the dashboard roster) and the active ones are refetched. In addition:

- editing writes the updated member directly into `["crew", "detail", id]`, so the profile updates immediately;
- deleting removes `["crew", "detail", id]` from the cache.

## Structure

```
src/
  api/         fake API (localStorage, random delays and errors)
  components/  NavBar, ProtectedRoute, CrewCard, Pagination, ...
  context/     AuthContext (AuthProvider, useAuth)
  hooks/       useCrewList, useCrewMember, useAllCrew, useCrewMutations
  layouts/     RootLayout (NavBar + Outlet + Suspense)
  pages/       one file per route
  services/    service.js (API), authService.js (Firebase), queryKeys.js
  firebase.js  Firebase initialization
  styles/      index.css
  App.jsx      routes only
```

UI components never call the API, Firebase or `localStorage` directly; they use hooks and services.

## Deploy

`vercel.json` and `public/_redirects` redirect all paths to `index.html`, so direct URLs and page refresh work on Vercel and Netlify.

## Lab 7: Progressive Web App

- `manifest.webmanifest` defines the standalone install experience and includes 192px and 512px icons.
- The build generates a versioned `sw.js` precache manifest from Vite's actual JS/CSS bundles, the app shell, icons and offline page. Static assets use cache-first; navigations try the network first and return a previously visited page or `/offline.html` when offline.
- A new service worker waits until the user selects **Update now**. Activation removes older versioned caches and takes control of open tabs.
- The supplied API is simulated and its source dataset is stored in browser localStorage. A request-first wrapper saves list, roster and detail responses as local snapshots for up to seven days (maximum 50 entries) and falls back to them on failure. Firebase authentication traffic and user tokens are never written to service worker caches.
- The app always shows online/offline status, has a dedicated retryable offline screen, and adapts to narrow screens down to 320px. Service worker script caching is disabled at the hosting layer so browsers can discover updates.

Service workers require HTTPS in production (localhost is supported for development). Vercel and Netlify deploy the generated `dist` folder using the included SPA rewrites.


