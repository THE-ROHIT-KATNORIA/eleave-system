# E-Leave Management System

A modern, full-stack leave management application built with React, Node.js, Express, and MongoDB.

## 🌟 Features

### Student Features
- 📝 Submit leave requests with calendar interface
- 📊 View leave statistics and history
- ✅ Track leave status (Pending/Approved/Rejected)
- 📅 Monthly leave limit tracking
- 🔔 Real-time notifications

### Admin Features
- 👥 Manage leave requests by stream
- ✅ Approve or reject leave requests
- 📊 View dashboard with statistics
- 👤 Create additional admin accounts
- 🔍 Filter and search functionality

### General Features
- 🔐 Secure authentication with JWT
- 🎨 Modern, responsive UI
- 🌙 Smooth animations and loaders
- 📱 Mobile-friendly design
- 🔒 Role-based access control

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Styled Components** - Styling
- **Three.js** - 3D graphics
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Git

### Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/e-leave-management.git
cd e-leave-management
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## 🚀 Deployment

See [DEPLOY_VERCEL_RENDER.md](DEPLOY_VERCEL_RENDER.md) for detailed deployment instructions.

### Quick Deploy
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## 📝 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-uri
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com/api
```

## 🧪 Testing

```bash
cd client
npm test
```

**Test Coverage:** 77.9% (60/77 tests passing)

## 📂 Project Structure

```
e-leave-management/
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   └── hooks/         # Custom hooks
│   └── package.json
├── server/                # Backend Node.js app
│   ├── routes/           # API routes
│   ├── models/           # Mongoose models
│   ├── config/           # Configuration
│   └── package.json
└── README.md
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control
- CORS configuration
- Input validation

## 📊 Database Schema

### User Model
- name, email, password
- role (student/admin)
- rollNo, stream
- monthlyLeaveLimit

### Leave Model
- userId, startDate, endDate
- reason, status
- stream, createdAt

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Your Name - [GitHub Profile](https://github.com/YOUR_USERNAME)

## 🙏 Acknowledgments

- React Team
- MongoDB Team
- Vercel & Render for hosting

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Made with ❤️ using React and Node.js**
