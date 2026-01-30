Title: Admin Panel — Functionality Only (CRUD + Image Handling)

Prompt:
You are building an Admin Panel for an existing Express/MongoDB backend. Only implement the **functional features** (no deployment, CI, testing, or docs requested). Focus on UI pages, API integration, flows, and acceptance criteria.

Base info
- Base API: http://localhost:3000/api
- Auth: JWT via Authorization: Bearer <token>. Use existing login endpoint to obtain token.

Required features & behavior

1. Authentication & Access
- Login page (email + password). Store JWT securely (memory or sessionStorage). Protect all admin routes (redirect non-auth users to login).
- Global layout with sidebar, header, and logout.

2. Products (FULL CRUD + Image Management)
- List page: pagination, search, filters (category, subcategory, price range, grams).
- Create product:
  - Form fields: name, categoryId, subcategoryId, grams, rate, description.
  - Multiple images upload (field name: `images`, allow up to 6). For each uploaded file provide client-side preview, reorder, and alt text inputs (`alt_0`, `alt_1`, ...).
  - Submit as FormData: product fields + files + alt_N fields.
  - Validate max images (6) and size ≤5MB per file.
- Edit product:
  - Update fields and add new images (append); allow removing existing images.
  - For removals, send `removePublicIds` (array of public_id) OR call image delete endpoint.
- Delete product with confirmation.
- Product detail view: gallery of images (show alt text), product data.
- API mapping:
  - POST /api/products (auth+admin, multipart `images`)
  - GET /api/products (auth)
  - PUT /api/products/:id (auth+admin, multipart `images`, support removePublicIds)
  - DELETE /api/products/:id (auth+admin)
  - POST /api/products/:id/images (auth+admin) — to add images after creation
  - DELETE /api/products/:id/images/:publicId (auth+admin) — to remove image

3. Categories & Subcategories (CRUD)
- Categories: list, create, edit, delete, search, pagination.
- Subcategories: list, create (choose parent category), edit, delete.
- API mapping:
  - /api/categories (standard CRUD)
  - /api/subcategories (standard CRUD)

4. Banner (Hero Image)
- View current active banner (GET /api/banner).
- Upload new banner (auth+admin):
  - Form: image (`image`), title, link, alt.
  - Preview image before submit.
  - API mapping:
    - POST /api/admin/banner (auth+admin, multipart `image`)
    - GET /api/banner (public)

5. Users & Pending Verification
- View users list and a separate "Pending" filter/tab.
- Verify user action (admin):
  - Calls PUT /api/admin/verify-user/:id
- User detail modal/view.

6. Inquiries
- List inquiries, view full message modal/detail, mark resolved/unresolved, reply via existing backend email endpoint (if available).
- API mapping: /api/inquiry endpoints (list and reply).

7. UX Requirements & Edge Cases
- Image UX: previews, reorder, alt text inputs, show upload progress, retry on partial failures, inline validation messages.
- Error handling: show toasts for success/error, redirect to login on 401, friendly messages on upload failure.
- Forms: client-side validation (required fields, numeric ranges, image size/count).
- Concurrency: show warnings if resource changed by another admin (simple optimistic check or refresh notice).

Acceptance Criteria (Functional)
- Admin can log in and access protected pages.
- Admin can perform CRUD on products, categories, subcategories.
- Product creation/edit supports uploading multiple images, setting alt text, reordering, and removing images.
- Banner can be uploaded and previewed; active banner is returned via GET /api/banner.
- Admin can verify pending users.
- Inquiries can be viewed and replied to.
- All image uploads follow the field naming convention and limits: `images` (files), `alt_0`, `alt_1`..., max 6 images, ≤5MB each.

Implementation notes (short)
- Use FormData for uploads. Match alt text to file order with `alt_0`, `alt_1`, ...
- Provide clear UI for add/remove images and show upload progress.
- If an endpoint is missing or payload differs, ask before implementing.
