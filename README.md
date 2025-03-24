# 🎬 Movie Ticket Booking System

A comprehensive web application for online movie ticket booking and management.

![Movie Ticket Booking](https://img.shields.io/badge/Project-Movie%20Ticket%20Booking-brightgreen)
![Version](https://img.shields.io/badge/Version-1.0.0-blue)

## 📋 Overview

**Movie Ticket Booking** is a modern platform that allows users to conveniently book movie tickets online. The project features both user-facing systems for ticket booking and administrative systems for managing movies, screenings, theaters, and booking transactions.

## ✨ Key Features

### 👤 User Features
- **Account Management**
  - User registration and authentication
  - Personal profile management
- **Movie Experience**
  - Browse current movies with detailed information
  - Book tickets with seat selection
  - Online payment processing
  - Submit movie reviews and ratings

### 🔧 Admin Features
- **Content Management**
  - Movie catalog administration
  - Screening schedule management
  - Theater and seating configuration
- **Business Operations**
  - Booking transaction monitoring
  - Promotion and discount management
  - User data administration

## 🛠️ Technology Stack

### Frontend
- **React.js** - Modern UI library for building interactive interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Ant Design** - UI component library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Prisma ORM** - Next-generation ORM
- **JWT** - Secure authentication mechanism

### Admin Panel
- **React Admin** - Admin interface framework

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- PostgreSQL

### Step 1: Clone the repository
```bash
git clone https://github.com/nthnhan19/Project_MovieTicketBooking_NodeJS.git
cd Project_MovieTicketBooking_NodeJS
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your database connection in .env
npm run dev
```

### Step 3: Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```

### Step 4: Admin Panel Setup
```bash
cd ../admin
npm install
npm run dev
```

## 📂 Project Structure
```
Project_MovieTicketBooking_NodeJS/
├── admin/           # Admin Panel (React Admin)
├── backend/         # Backend (Node.js + Express)
├── frontend/        # Frontend (React.js)
├── .gitignore       # Git ignore file
├── README.md        # Project documentation
└── .gitattributes   # Git attributes file
```

## 🔮 Future Development Goals

- [ ] Complete payment gateway integration
- [ ] Enhance user interface and experience
- [ ] Implement advanced movie search functionality
- [ ] Add personalized movie recommendations
- [ ] Mobile application development
- [ ] Multi-language support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact & Support

- **Email**: ngochanpt2018@gmail.com
- **GitHub**: [Project_MovieTicketBooking_NodeJS](https://github.com/nthnhan19/Project_MovieTicketBooking_NodeJS)



---

<p align="center">🎥 <b>Happy Movie Booking!</b> 🍿</p>
