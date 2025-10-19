# CSE299-Group-3

### Clone this repository

You can clone via HTTPS or SSH:

```bash
# HTTPS
git clone https://github.com/SafatUddin/CSE299-Group-3.git

# or SSH
git clone git@github.com:SafatUddin/CSE299-Group-3.git
```

Then:

```bash
cd CSE299-Group-3
```

## How to Run

Follow these steps to run the backend API and the frontend app locally. This repository already includes environment files; review and update them if needed.

### env.example(implement in backend)

```
OPENSSL_CONF=/home/safat/.mongodb-tls-fix/openssl_no_rh.conf
PORT=5000
MONGODB_URI=mongodb+srv://SafatUddin:voodoovader@cluster0.eshlohp.mongodb.net/CSE299?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=anakinthechosenonedarthvader
FRONTEND_URL=http://localhost:5173
SEND_GRID_API=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
FROM_EMAIL=mekakashi17@gmail.com


ARCJET_ENV=development


ARCJET_KEY=ajkey_01k7b2wbsnfvsrhgs9dbqxg5e2
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



## Proposal/Review
### Project Proposal

[Project Proposal Report](./Documents/CSE299_Project_Proposal_Group-3.pdf)

### Project Proposal Presentation

[Project Proposal Presentation](./Documents/Project_Proposal_Group-3_Presentation.pdf) -> [Alternate link](https://drive.google.com/file/d/1c_V2gUpclm6B3QuC5Vt8E9SqDrkchXZt/view?usp=drive_link)



## Update-1

[Video Demo](https://youtu.be/MfleyOah9Zo)

Backend (Done by Safat):
- Set up Express server with CORS and request logging (morgan), environment variables via dotenv, and MongoDB connection using Mongoose.
- Implemented auth features with validation using zod/zod-express-middleware:
	- Register: creates user with hashed password (bcrypt), prevents duplicate emails, and sends a verification email via SendGrid with a JWT token stored in a `Verification` collection.
	- Verify Email: verifies the token, marks user as verified, deletes verification record.
	- Login: validates credentials, enforces email verification, regenerates verification if needed, returns a 7-day JWT and user data (password omitted), updates last login.
	- Forgot/Reset Password: creates and emails a time-limited JWT link; token is checked before allowing password reset.
- Security and safety: JWT-based flows, CORS tied to `FRONTEND_URL`, and Arcjet email inspection to prevent abuse.

Frontend (Done by Farhan & Zunayed):
- React Router v7 setup with TypeScript, Tailwind CSS, and component library wiring. App includes forms with react-hook-form + zod validation and toast feedback.
- Auth pages and flows implemented:
	- The Home page provides a welcoming introduction to the app, with clear calls-to-action for users to either sign up or sign in.(Done by Farhan)
    - Sign Up with client-side validation and success redirect to Sign In.(Done by Zunayed)
	- Sign In that stores auth state via a provider and navigates to Dashboard.(Done by Zunayed)
	- Email verification screen that reads `token` from URL and calls the backend.(Done by Farhan)
	- Forgot Password and Reset Password screens that orchestrate the email and token-based reset process.(Done by Farhan)
- Project structure with routes, hooks for API calls, and basic dashboard/home route scaffolding.

Project flow (how it works end-to-end):
- A new user signs up on the frontend; the backend creates the user, generates a verification JWT, stores it, and emails a verification link that points back to the frontend (using `FRONTEND_URL`).
- The user clicks the link; the frontend verifies the token with the backend. After success, the user can log in.
- On login, the backend validates password and verification status. If unverified/expired, a new verification flow is triggered. On success, a login JWT is returned and the frontend stores session state.
- If the user forgets their password, the frontend starts a reset flow; the backend generates a time-limited reset token, emails a link, and on confirmation updates the password