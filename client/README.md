# Story Generator

A modern web application for story generation.

## 🌟 Live Demo

[Coming Soon]

## 📖 Project Description

Story Generator is a web-based application that allows users generate and manage their stories. The application features:
- User authentication system
- Story generation assistance
- Story organization and management
- Responsive design for all devices

## 💭 Why This Project

I made this project to practice my full-stack skills. I have had a bit of experience making front end projects, but I have never created backend APIs before, and I have not integrated MySQL databases into a web application either. This project gave me a good opportunity to practice both, as well as creating a secure user authentication process. I also got a chance to use the OpenAI API.

This project initially started as a school project I made with some classmates of mine. The original repo is here: https://github.com/MartinS3030/Story_Generator. During the school year, we had many projects and assignments, so we only created the project in vanilla JavaScript to save some time. After I graduated, I wanted to refactor this project using a more modern tech stack of React, Next.js, and Tailwind. I also added some features to this project that makes the experience a bit more intuitive and useful. This gave me the chance to create more backend services, while continuing to develop my front end skills.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- MySQL (v8.0 or higher)

### Installation

1. Clone the repository
```bash
git clone https://github.com/MartinS3030/Journal
```

2. Set up the server
```bash
# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file in the server directory with the following variables:
# DB_HOST = [Your host name, localhost if running locally]
# DB_USER = [Your DB user]
# DB_PASSWORD = [Your DB password]
# DB_NAME = [Your DB name]
# DB_PORT = [Your DB port]
# JWT_SECRET= [Your JWT secret]
# OPENAI_API_KEY= [You will need an API key to run locally]
# OPENAI_ORGANIZATION_KEY= [You will need an org key to run]

# Start the server
npm run dev
```

3. Set up the client
```bash
# Open a new terminal and navigate to the client directory
cd client

# Install dependencies
npm install

# Create a .env file in the client directory with:
# NEXT_PUBLIC_APP_DOMAIN="http://localhost:4000"

# Start the development server
npm run dev
```

The application will be available at:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000](http://localhost:4000)

### Environment Variables

#### Server (.env)
```
DB_HOST = [Your host name, localhost if running locally]
DB_USER = [Your DB user]
DB_PASSWORD = [Your DB password]
DB_NAME = [Your DB name]
DB_PORT = [Your DB port]
JWT_SECRET= [Your JWT secret]
OPENAI_API_KEY= [You will need an API key to run locally]
OPENAI_ORGANIZATION_KEY= [You will need an org key to run]
```

#### Client (.env)
```
NEXT_PUBLIC_APP_DOMAIN="http://localhost:4000"
```

## 💻 System Requirements

- **Modern Web Browser:** Chrome, Firefox, Safari, or Edge (latest versions)
- **Screen Resolution:** Optimized for all device sizes

## 🛠️ Technologies Used

### Programming Languages
- TypeScript
- JavaScript
- HTML5
- CSS3

### Frameworks & Libraries
- Next.js 14 - React framework
- Tailwind CSS - Styling
- React Query - Data fetching
- Express.js - Backend framework

### Database
- MySQL - Relational database

### Development Tools
- TypeScript - Type safety
- ESLint - Code linting
- Prettier - Code formatting
- Git - Version control

## ✨ Key Features

- **User Authentication:** Secure login and registration system
- **Story Management:** Create, edit, and organize stories
- **Responsive Design:** Works seamlessly on all devices
- **Story Generation:** AI-assisted creative writing tools

