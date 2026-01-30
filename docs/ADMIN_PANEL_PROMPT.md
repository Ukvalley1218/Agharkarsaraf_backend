Title: Build a Production-Ready Admin Panel (React + JavaScript) for existing backend

Prompt:
You are building a production-ready Admin Panel (web app) for an existing Express/MongoDB backend (repo: agharkarsaraf_backend). Implement the full frontend with code, tests, docs and deployment config.

Project constraints / base info
- Base API URL: http://localhost:3000/api
- Auth: JWT via Authorization: Bearer <token>. Backend provides login/registration and an admin role (admin middleware). Use Authorization header for requests.
- Key backend endpoints (must integrate with these; adjust if names differ):
  - Auth: POST /api/auth/login, POST /api/auth/register (use login)
  - Admin: GET /api/admin/pending-users, PUT /api/admin/verify-user/:id
  - Banner: POST /api/admin/banner (auth+admin, multipart field name `image`), GET /api/banner
  - Products: POST /api/products (auth+admin, multipart `images`), GET /api/products, PUT /api/products/:id, DELETE /api/products/:id
  - Product images: POST /api/products/:id/images (auth+admin multipart `images`), DELETE /api/products/:id/images/:publicId
  - Categories/Subcategories: existing CRUD endpoints under /api/categories and /api/subcategories
  - Inquiry: /api/inquiry (list/submit)
  - Email service exists for replies
- Images: backend accepts multi-part uploads (multer, Cloudinary). Max individual image 5MB, multiple images allowed (example limit 6).

Tech stack & architecture (preferred)
- React + JavaScript (Vite)
- UI library: MUI (or Tailwind + headless components)
- State & server data: React Query (TanStack Query) for API calls + axios
- Forms: react-hook-form + Yup for validation
- Routing: React Router
- File uploads: FormData, preview client-side, progress indicators
- Testing: Jest + React Testing Library (unit) and Cypress (e2e)
- CI: GitHub Actions
- Accessibility & responsiveness required
- Optional: Storybook for major components

Feature list (pages & behavior)
1. Authentication & layout
   - Login page for admin (email + password) → store JWT (secure - prefer memory + fallback to sessionStorage)
   - Protected routes: only allow admins, redirect to login
   - Global layout with sidebar, top bar, responsive menu and logout

2. Dashboard (Overview)
   - Metrics: total users, pending users, products count, categories, active banner preview, recent inquiries
   - Quick actions: verify pending users, create product, view latest inquiries
   - Charts (optional): simple counts trends

3. Users Management
   - List all users (pagination, search)
   - Show pending users in separate tab or filter; ability to verify a user (`PUT /api/admin/verify-user/:id`)
   - View user details modal

4. Categories & Subcategories
   - CRUD for categories and subcategories
   - For subcategory creation show category selector
   - Search, pagination, validation

5. Products Management
   - List with filters (category, subcategory, price/gram ranges, search), pagination
   - Create/Edit product forms:
     - Accept multiple images (field `images`), show previews, allow reordering and alt text for each image
     - Send images via FormData (images[]). Add alt text fields named alt_0, alt_1, ... for per-file alt text
     - Validate max images (6) and size (≤5MB)
   - Product detail view (images gallery)
   - Delete product (with confirmation)
   - Add/Delete images after creation: use POST /api/products/:id/images and DELETE /api/products/:id/images/:publicId
   - Show upload progress and handle partial failures

6. Banner (Hero) Management
   - View current active banner (GET /api/banner)
   - Upload new banner (POST /api/admin/banner with `image`) with title/link/alt — preview before submit
   - If upload succeeds, backend deactivates previous banner; show confirmation

7. Inquiries
   - List inquiries, view message details
   - Mark resolved/unresolved
   - Reply to inquiry through backend (use existing email service; provide a reply modal that calls appropriate endpoint or an admin-only API)

8. Notifications, toasts & error handling
   - Global toast notifications for success/error
   - Inline field errors for forms
   - Loading states, skeletons for lists

9. Audit & Logs (optional)
   - Basic activity log for key admin actions (verify user, delete product, upload banner)

UI/UX requirements
- Responsive mobile-first design
- Accessible (WCAG basics): semantic HTML, alt text, keyboard navigation, color contrast
- Friendly validation & confirmations for destructive actions
- Provide visual image preview and remove-before-upload features

API integration details (examples)
- Upload new product:
  - FormData: fields for JSON product data + multiple files `images`
  - For alt text: send fields alt_0, alt_1 matching order of files
- Verify user:
  - PUT /api/admin/verify-user/:id with Authorization header
- Fetch banner:
  - GET /api/banner (public)

Error cases & edge conditions
- Handle token expiry: redirect to login, show message
- Partial upload errors: retry option and show failed files
- Image size/format validation client-side and server errors mapping
- Race conditions when multiple admins update the same resource

Deliverables
- Full frontend repo with clear README including:
  - Setup steps, .env keys, start/build/test scripts
  - How to create a sample admin account / toggle admin role (DB seed instruction)
- Implement unit tests for all key components and integration tests for API flows
- Add e2e tests (Cypress) covering login, product create/edit (including image upload), banner upload, and user verification
- GitHub Actions workflow: run tests and build on push
- A final handover doc with sample API calls (curl), developer notes, and mock admin token instructions if needed

Acceptance criteria (Definition of Done)
- Admin can login and perform all listed admin actions via UI
- Product create/edit supports multiple image uploads and image management via the UI
- Banner upload updates live banner and is shown in Dashboard with preview
- Lists use pagination and search; forms validate inputs
- Tests pass (unit + e2e), and CI workflow is added
- Responsive & accessible basic compliance
- Repo contains README and run instructions

Additional instructions for you (developer)
- If any backend endpoint is missing, create clear TODOs and confirm expected route and payload before implementation
- Use mock data & storybook for components while backend endpoints are not ready
- For uploads, implement graceful fallback if Cloudinary responds slowly/errors

Output specifics requested from Claude
- Provide the full source code for frontend (committed tree)
- Provide tests and CI config
- Example .env.sample
- A README with run/test/deploy instructions and a short deployment guide (Netlify/Vercel)
- A short estimate (time in days) and task breakdown per UI page/feature

Note: If you need clarifications on any API payload or route name, consult me before proceeding.
