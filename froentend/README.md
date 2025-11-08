
# MediBook - Doctor Appointment Booking Platform

MediBook is a full-stack application for booking doctor appointments. This platform allows users to browse doctors, book appointments, and make payments.

## Tech Stack

### Frontend
- React.js with TypeScript
- Tailwind CSS for styling
- React Router for routing
- Axios for API requests
- JWT for authentication

### Backend
- Node.js with Express
- MongoDB with Mongoose ORM
- JWT for authentication and authorization
- Bcrypt for password hashing
- Stripe for payment processing

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB instance (local or Atlas)
- Stripe account for payment processing

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file:
   ```
   # Server configuration
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

4. Seed the database with initial doctor data:
   ```
   node scripts/seedDoctors.js
   ```

5. Start the backend server:
   ```
   npm start
   ```
   For development with auto-reload:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory (root directory):
   ```
   cd ../
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

#### Register User
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "patient"
  }
  ```
- **Response**: User data with JWT token

#### Login User
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**: 
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: User data with JWT token

### Doctor Endpoints

#### Get All Doctors
- **URL**: `/api/doctors`
- **Method**: `GET`
- **Query Parameters**:
  - `specialty` (optional): Filter by specialty
  - `featured` (optional): Filter by featured status
- **Response**: Array of doctors

#### Get Doctor By ID
- **URL**: `/api/doctors/:id`
- **Method**: `GET`
- **Response**: Doctor details

#### Get Doctor Availability
- **URL**: `/api/doctors/:id/availability`
- **Method**: `GET`
- **Query Parameters**:
  - `date`: Date for availability check (YYYY-MM-DD)
- **Response**: Available time slots

### Appointment Endpoints

#### Create Appointment
- **URL**: `/api/appointments`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "doctorId": "doctor_id",
    "date": "2023-10-15",
    "time": "10:00 AM",
    "patientName": "John Doe",
    "patientEmail": "john@example.com",
    "patientPhone": "1234567890",
    "reason": "Regular checkup",
    "notes": "First visit"
  }
  ```
- **Response**: Created appointment

#### Get User Appointments
- **URL**: `/api/appointments/user`
- **Method**: `GET`
- **Auth**: Required
- **Response**: Array of user's appointments

#### Update Appointment Status
- **URL**: `/api/appointments/:id/status`
- **Method**: `PUT`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "status": "confirmed"
  }
  ```
- **Response**: Updated appointment

### Payment Endpoints

#### Create Payment
- **URL**: `/api/payments/create`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "appointmentId": "appointment_id",
    "paymentMethod": "online"
  }
  ```
- **Response**: Payment session data

#### Verify Payment
- **URL**: `/api/payments/verify`
- **Method**: `POST`
- **Auth**: Required
- **Body**: 
  ```json
  {
    "appointmentId": "appointment_id",
    "sessionId": "stripe_session_id"
  }
  ```
- **Response**: Payment verification result

## Authentication Flow
1. User registers or logs in
2. Backend validates credentials and returns JWT token
3. Frontend stores token in browser's localStorage
4. Token is sent with subsequent requests in the Authorization header
5. Protected routes check for valid token

## Deployment Considerations
- Set up proper environment variables for production
- Configure CORS for production domains
- Secure MongoDB connection with authentication
- Use HTTPS in production
- Consider using a process manager (PM2) for Node.js backend

## Demo Accounts
For testing, you can use the following accounts:

- **Admin**: admin@example.com / password
- **Doctor**: doctor@example.com / password
- **Patient**: patient@example.com / password
