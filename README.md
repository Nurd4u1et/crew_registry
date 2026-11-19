# Crew Registry

React SPA for managing the crew of an orbital station. Built with React, React Router v6, TanStack Query, Firebase Authentication and Vite.


| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | App ID |


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



