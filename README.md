# E-commerce React + Vite App

This is a modern e-commerce application built with React and Vite, using Firebase for authentication and TailwindCSS for styling.

## Live demo: 

### https://e-commerce-react-eight-gules.vercel.app/
or,
### https://full-ecommece.netlify.app/

### Prerequisites

- Node.js (v18 or higher recommended)
- Firebase account and project

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-name>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Update `.env` with your Firebase configuration keys.

### Development

To start the development server:
```bash
npm run dev
```

### Production Build

To build the application for production:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

## Deployment on Vercel

1. **Push to GitHub**: Make sure your code is pushed to a GitHub repository.
2. **Connect to Vercel**: create a new project on Vercel and import your repository.
3. **Environment Variables**: In the Vercel dashboard for your project, go to **Settings > Environment Variables** and add all variables from your `.env` file (e.g., `VITE_FIREBASE_API_KEY`, etc.).
4. **Deploy**: Vercel will automatically detect Vite and build your project.

## Features

- User Authentication (Firebase)
- Product browsing and filtering
- Shopping Cart and Wishlist
- Responsive Design (TailwindCSS)
