# PG Maintenance Application

A comprehensive PG (Paying Guest) maintenance management system built with React, Node.js, Express, and MongoDB.

## 🚀 Features

- **Role-based Access Control**: Superadmin, Admin (PG Owner), and User (Tenant) roles
- **Multi-branch Support**: Manage multiple PG locations
- **Real-time Notifications**: Socket.IO for live updates
- **Analytics Dashboard**: Charts and reports for insights
- **Payment Management**: Rent collection and tracking
- **Ticket System**: Support ticket management
- **File Upload**: Image and document handling
- **Multi-language Support**: English and Hindi
- **Responsive Design**: Mobile-first approach
- **Dark/Light Theme**: Customizable themes

## 🛠️ Tech Stack

### Frontend
- React 18 with hooks
- Redux Toolkit for state management
- Tailwind CSS for styling
- Framer Motion for animations
- Shadcn UI components
- Axios for API calls
- Socket.IO for real-time updates
- Chart.js for analytics

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Redis for caching
- Socket.IO for real-time
- Nodemailer for emails
- Multer for file uploads
- Winston for logging

## 📁 Project Structure

```
/pg-maintenance-app/
├── /backend/                 # Backend server
│   ├── /src/
│   │   ├── /config/         # Configuration files
│   │   ├── /controllers/    # Route controllers
│   │   ├── /middleware/     # Custom middleware
│   │   ├── /models/         # Database models
│   │   ├── /routes/         # API routes
│   │   ├── /services/       # Business logic
│   │   ├── /utils/          # Utility functions
│   │   └── server.js        # Server entry point
│   ├── /uploads/            # File uploads
│   └── package.json
├── /frontend/               # Frontend application
│   ├── /src/
│   │   ├── /components/     # React components
│   │   ├── /pages/          # Page components
│   │   ├── /services/       # API services
│   │   ├── /store/          # Redux store
│   │   ├── /hooks/          # Custom hooks
│   │   ├── /layouts/        # Layout components
│   │   └── /utils/          # Utility functions
│   └── package.json
└── package.json             # Root package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or cloud)
- Redis (optional, for caching)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pg-maintenance-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   **Backend (.env)**
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/pg_maintenance
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the application**

   **Development (both frontend and backend)**
   ```bash
   # From root directory
   npm run dev
   ```

   **Or start separately:**
   ```bash
   # Backend (from backend directory)
   cd backend
   npm run dev

   # Frontend (from frontend directory)
   cd frontend
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📋 Development Phases

### Phase 1: Superadmin (Weeks 1-3) ✅
- [x] Project setup and authentication
- [x] Basic server and client structure
- [ ] PG management (CRUD)
- [ ] Ticket management system
- [ ] Payment tracking
- [ ] Analytics dashboard
- [ ] Report generation
- [ ] Audit logging

### Phase 2: PG Admin (Weeks 4-6)
- [ ] Admin onboarding
- [ ] Branch management
- [ ] Room management
- [ ] Resident management
- [ ] Staff management
- [ ] Payment collection
- [ ] Salary disbursement
- [ ] Admin analytics

### Phase 3: User/Tenant (Weeks 7-8)
- [ ] Tenant dashboard
- [ ] Payment interface
- [ ] Ticket submission
- [ ] Feedback system
- [ ] Onboarding/offboarding
- [ ] Notification system

### Phase 4: Testing & Optimization (Weeks 9-10)
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance optimization
- [ ] Security audit

### Phase 5: Deployment (Weeks 11-12)
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Production configuration
- [ ] Monitoring setup
- [ ] Documentation

## 🔧 Available Scripts

### Root Directory
```bash
npm run dev          # Start both frontend and backend
npm run dev:backend  # Start backend only
npm run dev:frontend # Start frontend only
npm run build        # Build both applications
npm run test         # Run all tests
npm run lint         # Run linting
npm run format       # Format code
```

### Backend
```bash
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Format code
```

### Frontend
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Run ESLint
npm run format       # Format code
```

## 🔐 Security Features

- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- CORS protection
- XSS and CSRF protection
- Secure file uploads
- Audit logging

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### PG Management
- `GET /api/pg` - Get all PGs
- `POST /api/pg` - Create PG
- `GET /api/pg/:id` - Get PG by ID
- `PUT /api/pg/:id` - Update PG
- `DELETE /api/pg/:id` - Delete PG

### Tickets
- `GET /api/tickets` - Get all tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create payment
- `GET /api/payments/:id` - Get payment by ID
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment

### Analytics
- `GET /api/analytics/dashboard` - Dashboard analytics
- `GET /api/analytics/revenue` - Revenue analytics
- `GET /api/analytics/occupancy` - Occupancy analytics
- `GET /api/analytics/payments` - Payment analytics

### Reports
- `GET /api/reports/financial` - Financial reports
- `GET /api/reports/occupancy` - Occupancy reports
- `GET /api/reports/payments` - Payment reports
- `GET /api/reports/tickets` - Ticket reports

### Audit
- `GET /api/audit/logs` - Get audit logs
- `GET /api/audit/logs/:id` - Get audit log by ID
- `GET /api/audit/export` - Export audit logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@pgmaintenance.com or create an issue in the repository.

## 🔄 Version History

- **v1.0.0** - Initial release with basic authentication and dashboard
- **v1.1.0** - Added PG management features
- **v1.2.0** - Added payment and ticket systems
- **v1.3.0** - Added analytics and reporting
- **v1.4.0** - Added multi-language support and themes

---

**Built with ❤️ for efficient PG management** 