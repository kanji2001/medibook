# MediBook Backend API

> ### Razorpay Setup (Test Mode)
> 1. Create a Razorpay account and switch to the **Test Mode** dashboard.
> 2. Generate API credentials under **Settings → API Keys** and copy the `Key ID` and `Key Secret`.
> 3. Duplicate `.env.example` as `.env` in `backend/` (or project root) and add the values to `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Never commit live credentials.
> 4. Restart the Node.js server after updating environment variables (`npm install` first to pull the `razorpay` dependency).
> 5. Configure the Vite frontend with `VITE_API_BASE_URL=http://localhost:5000` for local testing.
> 6. To move to live payments, toggle Razorpay to **Live Mode** and replace the keys with live credentials in your `.env` file; no code changes are required.

This is the backend for the MediBook doctor appointment booking application.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd medibook-backend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env` file in the root directory and add the following:

```
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/medibook

# JWT settings
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Stripe API keys (replace with your actual keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

4. **Seed the database with initial data**
```bash
npm run seed
# or
yarn seed
```

5. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

The API server will be running at http://localhost:5000

## 📚 API Documentation

### Authentication

#### Register a new user
```
POST /api/auth/register
```
Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient" // "patient", "doctor", or "admin"
}
```

#### Login
```
POST /api/auth/login
```
Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Doctor Endpoints

#### Get all doctors
```
GET /api/doctors
```
Query parameters:
- `specialty` (optional) - Filter by specialty
- `rating` (optional) - Filter by minimum rating
- `featured` (optional) - Filter featured doctors

#### Get a single doctor
```
GET /api/doctors/:id
```

#### Get doctor availability for a date
```
GET /api/doctors/:id/availability?date=YYYY-MM-DD
```

#### Update doctor availability (Requires doctor login)
```
PUT /api/doctors/availability
```
Request body:
```json
{
  "status": "available",
  "workingHours": [
    {
      "day": "Monday",
      "isWorking": true,
      "timeSlots": [
        {"time": "9:00 AM", "isBooked": false},
        {"time": "10:00 AM", "isBooked": false}
      ]
    },
    // Other days...
  ]
}
```

### Appointment Endpoints

#### Create an appointment (Requires login)
```
POST /api/appointments
```
Request body:
```json
{
  "doctorId": "doctor_id",
  "date": "2023-05-20",
  "time": "10:00 AM",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "123-456-7890",
  "reason": "Annual checkup",
  "notes": "Additional notes"
}
```

#### Get user appointments (Requires login)
```
GET /api/appointments/user
```

#### Get doctor appointments (Requires doctor login)
```
GET /api/appointments/doctor
```

#### Update appointment status (Requires login)
```
PUT /api/appointments/:id/status
```
Request body:
```json
{
  "status": "approved" // "pending", "approved", "paid", "unpaid", "confirmed", "completed", "cancelled"
}
```

### Payment Endpoints

#### Create payment (Requires login)
```
POST /api/payments/create
```
Request body:
```json
{
  "appointmentId": "appointment_id",
  "paymentMethod": "online" // "online" or "offline"
}
```

#### Verify payment (Requires login)
```
POST /api/payments/verify
```
Request body:
```json
{
  "appointmentId": "appointment_id",
  "sessionId": "stripe_session_id"
}
```

### User Endpoints

#### Get current user profile (Requires login)
```
GET /api/users/profile
```

#### Update user profile (Requires login)
```
PUT /api/users/profile
```
Request body:
```json
{
  "name": "Updated Name",
  "avatar": "https://example.com/avatar.jpg",
  "phone": "123-456-7890"
}
```

### Admin Endpoints (Requires admin login)

#### Get all users
```
GET /api/admin/users
```

#### Update user role
```
PUT /api/admin/users/:id
```
Request body:
```json
{
  "role": "doctor" // "patient", "doctor", or "admin"
}
```

#### Create doctor profile
```
POST /api/admin/doctors
```
Request body:
```json
{
  "userId": "user_id",
  "specialty": "Cardiologist",
  "experience": 10,
  "location": "Medical Center",
  "address": "123 Medical St",
  "phone": "123-456-7890",
  "about": "Doctor bio",
  "education": ["MD from Harvard"],
  "languages": ["English", "Spanish"],
  "specializations": ["Heart Surgery"],
  "insurances": ["Blue Cross"],
  "image": "https://example.com/doctor.jpg",
  "featured": true
}
```

#### Update doctor profile
```
PUT /api/admin/doctors/:id
```

#### Delete doctor profile
```
DELETE /api/admin/doctors/:id
```

#### Get all appointments
```
GET /api/admin/appointments
```

## 📝 Authentication and Authorization

* All protected routes require a valid JWT token in the Authorization header:
  ```
  Authorization: Bearer <token>
  ```

* Role-based route protection:
  - Routes marked with `authorize('doctor')` require a logged-in user with the doctor role
  - Routes marked with `authorize('admin')` require a logged-in user with the admin role

## 🧪 Test Accounts

After running the seed script, you can use these accounts for testing:

- **Patient**: 
  - Email: patient@example.com
  - Password: password

- **Doctor**: 
  - Email: sarah.johnson@example.com (and other doctor emails)
  - Password: password

- **Admin**: 
  - Email: admin@example.com
  - Password: password
