# SingleV E-commerce Frontend

The React/Vite storefront uses the Express/MongoDB API for authentication,
catalog data, cart operations, and orders.

## Requirements

- Node.js 20.19 or newer
- The backend running on port 5000
- MongoDB configured for the backend

## Development

1. Install frontend dependencies with `npm install`.
2. Configure and start the backend using `backend/.env.example`.
3. Copy `.env.example` to `.env` if you need to set a custom API URL. For local
   development, the default `/api/v1` URL is proxied to `http://localhost:5000`.
4. Start the frontend with `npm run dev`.

## Production

Set `VITE_API_URL` to the backend API URL ending in `/api/v1`, for example
`https://api.example.com/api/v1`. Configure the backend `CORS_ORIGIN` as the
exact storefront origin. The backend must use production JWT and cookie secrets
that are at least 32 characters long.

Build and preview with `npm run build` and `npm run preview`.
