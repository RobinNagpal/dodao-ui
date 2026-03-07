# Google Login Integration Plan for Insights-UI (KoalaGains)

## 1. How Google Login Works

Google Login uses the **OAuth 2.0 Authorization Code** flow to authenticate users. Here is how the flow works at a high level:

1. **User clicks "Sign in with Google"** on the application's login page.
2. **Redirect to Google's OAuth consent screen** - The application redirects the user to Google's authorization server (`accounts.google.com/o/oauth2/v2/auth`) with the following parameters:
   - `client_id` - The application's Google OAuth client ID
   - `redirect_uri` - Where Google should send the user after consent
   - `response_type=code` - Requesting an authorization code
   - `scope` - Permissions requested (e.g., `openid email profile`)
   - `state` - A CSRF protection token
3. **User authenticates and consents** - The user signs in to their Google account (if not already signed in) and grants the requested permissions.
4. **Google redirects back with an authorization code** - Google sends the user back to the application's `redirect_uri` with an authorization code in the query string.
5. **Server exchanges code for tokens** - The application's backend sends a POST request to Google's token endpoint (`oauth2.googleapis.com/token`) with:
   - The authorization code
   - `client_id` and `client_secret`
   - `redirect_uri` (must match the original)
   - `grant_type=authorization_code`
6. **Google returns tokens** - Google responds with:
   - `access_token` - For calling Google APIs
   - `id_token` - A JWT containing user identity claims (email, name, picture, sub)
   - `refresh_token` - For obtaining new access tokens (if `access_type=offline` was requested)
7. **Application verifies the `id_token`** and extracts user profile data (email, name, profile picture, Google user ID).
8. **Application creates or links the user** in its own database and establishes a session.

### Key Concepts
- **OAuth 2.0 vs OpenID Connect (OIDC):** Google Login uses OIDC (built on top of OAuth 2.0). OAuth 2.0 handles authorization; OIDC adds an identity layer with the `id_token`.
- **`id_token` (JWT):** Contains claims like `sub` (unique Google user ID), `email`, `name`, `picture`, and `email_verified`.
- **Scopes:** `openid` (required for OIDC), `email`, and `profile` are the standard scopes for login.
- **CSRF protection:** The `state` parameter prevents cross-site request forgery during the OAuth flow.

---

## 2. Current Authentication Setup in Insights-UI

### Existing Auth Architecture

The insights-ui project uses **NextAuth.js v4** with a **JWT session strategy** and a **Prisma database adapter**.

#### Key Files

| File | Purpose |
|------|---------|
| `shared/web-core/src/api/auth/authOptions.ts` | Master auth configuration with all providers (Google, Discord, Twitter, custom-email, crypto) |
| `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts` | Insights-UI specific auth overrides (custom session/JWT callbacks with role and email fields) |
| `insights-ui/src/app/api/auth/[...nextauth]/route.ts` | NextAuth API route handler |
| `insights-ui/src/app/api/auth/custom-email/login-signup-by-email/route.ts` | Custom email signup/login endpoint |
| `insights-ui/src/app/login/page.tsx` | Login page (currently email-only) |
| `insights-ui/src/components/login/user-login.tsx` | Email login form component |
| `insights-ui/src/components/login/email-sent-message.tsx` | Post-email-sent confirmation UI |
| `insights-ui/src/app/providers/SessionProvider.tsx` | NextAuth `SessionProvider` wrapper |
| `insights-ui/prisma/schema.prisma` | Database schema (User, Account, Session, VerificationToken models) |

#### Current Login Flow (Email-Only)
1. User enters email at `/login`.
2. POST to `/api/auth/custom-email/login-signup-by-email` creates/updates the user and sends a verification email via AWS SES.
3. User clicks the email link which navigates to `/auth/email/verify?token=...`.
4. The `custom-email` credentials provider in `getAuthOptions()` verifies the token, finds/creates the user, and returns user info.
5. NextAuth creates a JWT session.
6. The session callback enriches the session with `role`, `email`, `spaceId`, and a signed `dodaoAccessToken`.

#### Existing Google Provider (Unused)
The shared `getAuthOptions()` function in `shared/web-core/src/api/auth/authOptions.ts` **already includes a GoogleProvider** configuration (lines 258-274):
```typescript
GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  allowDangerousEmailAccountLinking: true,
  profile(profile) {
    return {
      name: profile.name,
      email: profile.email,
      emailVerified: profile.email_verified,
      image: profile.picture,
      id: profile.sub,
      username: profile.email || profile.sub,
      authProvider: 'google',
      spaceId: 'dodao-eth-1', // <-- hardcoded, needs to be changed for insights-ui
    };
  },
}),
```

**Key issue:** The `spaceId` is hardcoded to `'dodao-eth-1'`, which is incorrect for insights-ui. Insights-UI uses `KoalaGainsSpaceId` (from `@/types/koalaGainsConstants`).

#### Database Schema (Already Supports OAuth)
The Prisma schema already has the necessary models:
- **User model:** Has `authProvider` field (can store `'google'`), `email`, `username`, `spaceId`, etc.
- **Account model:** Stores OAuth provider details (`provider`, `providerAccountId`, `access_token`, `refresh_token`, `expires_at`).
- **Session model:** Stores session tokens linked to users.

No database schema changes are needed.

---

## 3. What Changes Are Needed

### 3.1 Google Cloud Console Setup (Pre-requisite)

- Create or configure a Google OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
- Set the **Authorized redirect URI** to: `https://<your-domain>/api/auth/callback/google` (and `http://localhost:3000/api/auth/callback/google` for local development).
- Note down the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 3.2 Environment Variables

Add to `insights-ui/.env` (and `.env.example`):
```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

These must also be added to the Vercel project settings for production/preview deployments.

### 3.3 Fix the `spaceId` in Google Provider Profile Callback

**Problem:** The shared `getAuthOptions()` hardcodes `spaceId: 'dodao-eth-1'` in the Google provider's `profile()` callback. This is wrong for insights-ui which uses a different spaceId.

**Solution options (choose one):**

#### Option A: Pass `spaceId` as a parameter to `getAuthOptions()` (Recommended)
Modify the shared `getAuthOptions()` function signature to accept a `spaceId` parameter, and use it in all OAuth provider profile callbacks. This is the cleanest approach as it keeps the shared code generic.

**File:** `shared/web-core/src/api/auth/authOptions.ts`
```typescript
export function getAuthOptions(
  p: PrismaUserHelper,
  authorizeCrypto: ...,
  overrides?: Partial<AuthOptions>,
  spaceId?: string  // NEW PARAMETER
): AuthOptions {
  const defaultSpaceId = spaceId || 'dodao-eth-1';
  // ... use defaultSpaceId in provider profile callbacks
}
```

**File:** `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts`
```typescript
export const authOptions = getAuthOptions(
  { user: userAdapter, verificationToken: verificationTokenAdapter, adapter: ... },
  () => Promise.resolve(null),
  { callbacks: { ... } },
  KoalaGainsSpaceId  // Pass the correct spaceId
);
```

**Impact on other projects:** Adding an optional parameter with a default value is backward-compatible. Other projects that call `getAuthOptions()` without the new parameter will continue using `'dodao-eth-1'`.

#### Option B: Override providers in insights-ui's authOptions
Override the `providers` array in the `overrides` parameter. This avoids changing shared code but duplicates provider configuration.

**Recommendation:** Option A is preferred for maintainability.

### 3.4 Update the Login Page UI

**File:** `insights-ui/src/app/login/page.tsx`

Add a "Sign in with Google" button alongside the existing email login form. When clicked, it calls `signIn('google')` from `next-auth/react`.

### 3.5 Update the Login Form Component

**File:** `insights-ui/src/components/login/user-login.tsx`

Add a Google sign-in button below the email form. The component should:
- Import `signIn` from `next-auth/react`.
- Add a "Sign in with Google" button with the Google logo/icon.
- Add a visual divider (e.g., "or") between the email form and the Google button.
- Call `signIn('google', { callbackUrl: '/' })` on click.

### 3.6 No Changes to Session/JWT Callbacks

The existing session and JWT callbacks in `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts` already:
- Look up the user by `token.sub` (which will be the user's database ID after Google login).
- Enrich the session with `role`, `email`, `spaceId`, `username`, and `dodaoAccessToken`.

These callbacks are provider-agnostic, so they work for both email and Google login without modification.

---

## 4. Step-by-Step Implementation Plan

### Step 1: Google Cloud Console Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Create an **OAuth 2.0 Client ID** (Web application type).
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://<production-domain>/api/auth/callback/google` (production)
6. Copy the Client ID and Client Secret.

### Step 2: Set Environment Variables
1. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `insights-ui/.env`.
2. Add them to `insights-ui/.env.example` (with placeholder values).
3. Add them to Vercel project environment variables for production and preview.

### Step 3: Update Shared Auth Options (Option A)
1. **File:** `shared/web-core/src/api/auth/authOptions.ts`
   - Add an optional `spaceId` parameter to `getAuthOptions()`.
   - Replace hardcoded `'dodao-eth-1'` in Google, Discord, and Twitter provider profile callbacks with the parameter value (defaulting to `'dodao-eth-1'`).
2. Verify that all other projects calling `getAuthOptions()` still compile without changes (since the parameter is optional with a default).

### Step 4: Update Insights-UI Auth Options
1. **File:** `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts`
   - Pass `KoalaGainsSpaceId` as the `spaceId` argument to `getAuthOptions()`.

### Step 5: Update the Login UI
1. **File:** `insights-ui/src/components/login/user-login.tsx`
   - Add a Google sign-in button with the Google "G" logo.
   - Add a divider between the email form and the Google button.
   - Import and call `signIn('google', { callbackUrl: '/' })` on button click.
2. **File:** `insights-ui/src/app/login/page.tsx`
   - No structural changes needed if the Google button is self-contained in `user-login.tsx`.

### Step 6: Test the Integration
1. **Local testing:**
   - Start the insights-ui dev server (`yarn dev`).
   - Navigate to `/login`.
   - Click "Sign in with Google".
   - Verify redirect to Google consent screen.
   - After consent, verify redirect back to the app with an active session.
   - Check the database: confirm `User` record has `authProvider: 'google'` and correct `spaceId`.
   - Confirm `Account` record is created with Google provider details.
2. **Edge cases to test:**
   - User who previously signed up via email now signs in with Google (same email) - should link accounts due to `allowDangerousEmailAccountLinking: true`.
   - User who signs in with Google for the first time - new User and Account records should be created.
   - User revokes Google access and tries to sign in again.
   - Session persistence after Google login (refresh the page, check session).
3. **Cross-project verification:**
   - Build all projects in the monorepo (`yarn build`) to ensure no regressions.
   - Specifically verify that `academy-ui`, `simulations`, and other projects that use `getAuthOptions()` still compile and function correctly.

### Step 7: Deploy and Verify
1. Push changes and create a PR.
2. Verify CI passes (lint, type check, build).
3. Verify Vercel preview deployment works.
4. Test Google login on the preview URL.
5. Merge and verify production deployment.

---

## 5. Files to Be Modified

| File | Change | Project |
|------|--------|---------|
| `shared/web-core/src/api/auth/authOptions.ts` | Add optional `spaceId` param; use it in OAuth provider profile callbacks instead of hardcoded value | shared (backward-compatible) |
| `insights-ui/src/app/api/auth/[...nextauth]/authOptions.ts` | Pass `KoalaGainsSpaceId` to `getAuthOptions()` | insights-ui |
| `insights-ui/src/components/login/user-login.tsx` | Add Google sign-in button with divider | insights-ui |
| `insights-ui/.env.example` | Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` placeholders | insights-ui |

---

## 6. Files That Should NOT Be Modified

- `insights-ui/prisma/schema.prisma` - Already has the correct models (User, Account, Session) to support OAuth.
- `insights-ui/src/app/api/auth/[...nextauth]/route.ts` - Already exports the NextAuth handler correctly.
- `insights-ui/src/app/providers/SessionProvider.tsx` - Already wraps the app with NextAuth's `SessionProvider`.
- Any files in `academy-ui/`, `simulations/`, `news-reader/`, or other projects - These must not be impacted.

---

## 7. Ensuring No Impact on Other Projects

1. **Backward-compatible shared code change:** The `spaceId` parameter added to `getAuthOptions()` is optional and defaults to the existing `'dodao-eth-1'` value. Projects not passing this parameter will behave identically to before.
2. **No database schema changes:** The Prisma schema already supports OAuth providers. No migrations needed.
3. **No shared component changes:** The Google button is added only to the insights-ui login component, not to any shared component.
4. **No new shared dependencies:** `next-auth/react` (for `signIn()`) is already a dependency. The Google provider is already imported in the shared auth options.
5. **Build verification:** After implementation, run `yarn build` from the repo root to confirm all projects compile without errors.

---

## 8. Security Considerations

1. **`allowDangerousEmailAccountLinking: true`** is already set on the Google provider. This allows users with the same email to link their Google and email accounts. This is intentional for UX but means we trust Google's email verification. Since Google verifies emails, this is acceptable.
2. **CSRF protection:** NextAuth handles the `state` parameter automatically.
3. **Token storage:** OAuth tokens (access_token, refresh_token) are stored in the `Account` model. These are managed by NextAuth and not exposed to the client.
4. **Environment variable security:** `GOOGLE_CLIENT_SECRET` must never be exposed to the client. It is only used server-side in the NextAuth configuration.
5. **Redirect URI validation:** Only the registered redirect URIs in Google Cloud Console will be accepted, preventing open redirect attacks.
