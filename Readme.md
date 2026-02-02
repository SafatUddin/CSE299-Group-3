# CSE299: ProjectFlow -> A Project Management App


### Clone this repository

You can clone via HTTPS or SSH:

```bash
# HTTPS
git clone https://github.com/SafatUddin/CSE299_ProjectFlow_A_Project_Management_App.git

# or SSH
git clone git@github.com:SafatUddin/CSE299_ProjectFlow_A_Project_Management_App.git
```

Then:

```bash
cd CSE299-Group-3
```

## How to Run

Follow these steps to run the backend API and the frontend app locally. This repository already includes environment files; review and update them if needed.

### env.example

(implement this in the backend)
```
OPENSSL_CONF= 
PORT=5000
MONGODB_URI= enter your mogodb link
JWT_SECRET= enter  your JWT secret key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

ARCJET_ENV=development
ARCJET_KEY= Get your site key from https://app.arcjet.com
```


### Prerequisites
- Node.js 18+ and npm
- Internet access to install dependencies
- A MongoDB connection string (already provided in this instance)

### Environment variables
This repo contains `.env` files. Make sure the values are correct for your machine:
- Backend (`Main/backend/.env`):
	- `PORT` (default 5000)
	- `MONGODB_URI` (I have given my MongoDB connection string change if you need it)
	- `FRONTEND_URL` (e.g., `http://localhost:3000` or the dev URL printed by the frontend)
	- Email or auth keys your features require (e.g., `SENDGRID_API_KEY`, `JWT_SECRET`)
- Frontend: configure API base URLs in code or via environment as your app expects.

If you change the frontend dev port, update `FRONTEND_URL` in the backend `.env` so CORS allows requests.

### Run in development
Use two terminals—one for the backend and one for the frontend.

Backend (Terminal 1):
1) `cd Main/backend`
2) `npm install`
3) `npm run dev`  (starts an Express server; default port comes from `PORT` in `.env`)

Frontend (Terminal 2):
1) `cd Main/frontend`
2) `npm install`
3) `npm run dev`  (starts the React Router dev server; open the URL shown in the terminal)

Once both are running, navigate to the frontend URL printed in the terminal. The backend base URL should be `http://localhost:<PORT>` unless you changed it in `.env`.

### Build and run for production

Frontend:
1) `cd Main/frontend`
2) `npm install`
3) `npm run build`
4) `npm start`  (serves the built app using React Router’s server)

Backend:
1) `cd Main/backend`
2) `npm install`
3) `npm start`  (runs `node index.js`)

Ensure your production environment variables are set appropriately before starting.
