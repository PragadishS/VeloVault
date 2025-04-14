# 🚗 VeloVault - Vehicle Management System

![Uploading Screenshot 1947-01-24 at 6.53.55 PM.png…]()


## 📝 Project Overview

VeloVault is a comprehensive web application designed to help users manage their vehicle information, track service history, 
and maintain detailed vehicle records efficiently.

## ✨ Key Features

### 🔐 User Authentication
- User signup and login
- Guest user access
- Profile management
- Secure JWT-based authentication

### 🚙 Vehicle Management
- Add new vehicles
- Update vehicle details
- Delete vehicles
- Search vehicles by multiple criteria
  - Owner name
  - Car number
  - Company name

### 🛠 Service Tracking
- Add service history
- Track upcoming service dates
- View detailed service records

### 📊 Advanced Vehicle Insights
- Resale value estimation
- Vehicle lifespan prediction
- Maintenance recommendations
- Service history tracking

## 🛠 Technologies Used

### Frontend
- React
- React Hooks
- Axios for API communication
- Custom CSS with variables for theming

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

### Key Dependencies
- Frontend: react, axios, react-hooks
- Backend: express, mongoose, jsonwebtoken, bcrypt
- Development: dotenv, cors

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- MongoDB
- npm or yarn

### Backend Setup
1. Clone the repository
```bash
git clone https://github.com/your-username/velovault.git
cd velovault/backend
```

2. Install backend dependencies
```bash
npm install
```

3. Create a `.env` file in the backend directory
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3333
```

4. Start the backend server
```bash
npm start
```

### Frontend Setup
1. Navigate to frontend directory
```bash
cd ../frontend
```

2. Install frontend dependencies
```bash
npm install
```

3. Start the React development server
```bash
npm start
```

## 🗂 Project Structure

### Backend
- `models/`: Mongoose schemas
  - `User.js`: User data model
  - `Car.js`: Vehicle data model
- `routes/`: Express route handlers
  - `userRoutes.js`: Authentication routes
  - `carRoutes.js`: Vehicle management routes
- `server.js`: Main server configuration

### Frontend
- `components/`: React components
  - `Login.js`: User login component
  - `Signup.js`: User registration component
  - `AddVehicle.js`: Vehicle addition/update form
  - `VehicleCard.js`: Individual vehicle display
  - `VehicleList.js`: List of vehicles
- `AuthContext.js`: Authentication state management

## 🔒 Security Features
- Password hashing with bcrypt
- JWT-based authentication
- Protected routes
- Input validation
- Secure guest user creation

## 📱 Responsive Design
- Mobile-friendly
- Dynamic styling with CSS variables
- Dark theme with automotive-inspired design

  <p align="center">Made with ❤️ by Pragadish S</p>
