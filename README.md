# School ERP Management System

A comprehensive, full-stack Enterprise Resource Planning (ERP) system designed specifically for educational institutions. Built with modern web technologies to streamline school administration, student management, and educational operations.

## 🌟 Features

### 👥 Multi-Role Authentication System
- **Super Admin**: System-wide management and oversight
- **School Admin**: School-specific administration and management
- **ECA Coordinator**: Extra-curricular activities management

### 🏫 Core Modules

#### 🎓 School Management
- Multi-school support with individual configurations
- School-specific branding and themes
- Comprehensive school profiles and settings

#### 👨‍🎓 Student Management
- Complete student lifecycle management
- Class and section organization
- Student promotion and graduation tracking
- Detailed student profiles with photos
- Academic record maintenance

#### 🏆 Clubs & Activities Management
- Create and manage student clubs
- Activity tracking and scheduling
- Registration management for clubs
- Category-based club organization
- Leadership and participation tracking

#### 📚 Training Management
- Professional development training programs
- Registration and attendance tracking
- Feedback collection system
- Training materials distribution
- Multi-role access control

#### 📄 Document Management
- Centralized document storage
- Category-based organization
- Upload and download capabilities
- Access control by user roles
- Document preview functionality

#### 📅 Calendar & Events
- Integrated calendar system
- Event scheduling and management
- Multi-user event visibility
- Activity planning and coordination

#### 🛡️ ISO Management
- ISO compliance tracking
- Process documentation
- Quality management workflows
- Audit trail maintenance

#### 📊 Reports & Analytics
- Comprehensive dashboard analytics
- KPI tracking and visualization
- Student progress reports
- Activity participation metrics
- System usage statistics

#### 💬 Communication System
- Internal messaging platform
- Notification management
- Email integration
- Multi-channel communication

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.2.4 with React 18
- **Styling**: Tailwind CSS with custom components
- **UI Components**: Radix UI primitives
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Next.js API Routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HTTP-only cookies
- **Password Hashing**: bcryptjs
- **Email Service**: Nodemailer

### Development Tools
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Code Quality**: ESLint, Prettier
- **Build Tool**: Next.js built-in bundler

## 📁 Project Structure

```
creating-oppo/
├── app/                          # Next.js App Router
│   ├── (public)/                # Public routes (landing page, legal)
│   ├── api/                     # API endpoints
│   │   ├── auth/               # Authentication routes
│   │   ├── clubs/              # Club management APIs
│   │   ├── dashboard/          # Dashboard data APIs
│   │   ├── documents/          # Document management APIs
│   │   ├── students/           # Student management APIs
│   │   ├── trainings/          # Training management APIs
│   │   └── users/              # User management APIs
│   └── dashboard/              # Protected dashboard routes
├── components/                  # React components
│   ├── auth/                   # Authentication components
│   ├── dashboard/              # Dashboard components
│   ├── students/               # Student management components
│   ├── clubs/                  # Club management components
│   ├── trainings/              # Training components
│   ├── documents/              # Document components
│   └── ui/                     # Reusable UI components
├── lib/                        # Utility libraries
│   ├── api/                    # API client functions
│   ├── db/                     # Database operations
│   ├── email/                  # Email services
│   └── services/               # Business logic services
├── models/                     # TypeScript type definitions
├── scripts/                    # Database seeding scripts
└── utils/                      # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- MongoDB database
- Email service (Gmail/SMTP) for notifications

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd creating-oppo
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/school_erp
   MONGODB_DB=school_erp
   
   # JWT Configuration
   JWT_SECRET=your-super-secure-jwt-secret-key
   
   # Email Configuration (Optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=School ERP System
   
   # Application Configuration
   NODE_ENV=development
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Seed super admin user
   pnpm run seed
   
   # Seed class structure
   npx ts-node scripts/seed-class-structure.ts
   
   # Seed notification templates 
   npx ts-node scripts/seed-notification-templates.ts

   # Seed Conversations
   npx ts-node scripts/seed-conversations.ts
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

6. **Access the Application**
   - Open http://localhost:3000
   - Login with super admin credentials:
     - Email: `admin@schoolerp.com`
     - Password: `admin123`

## 📊 Default User Roles & Permissions

### Super Admin
- Full system access
- School creation and management
- User management across all schools
- System-wide analytics and reports
- Training creation and management

### School Admin
- School-specific student management
- Club and activity coordination
- Document management for their school
- Training participation and feedback
- School-specific analytics

### ECA Coordinator
- Club and activity management
- Event coordination
- Training participation
- Activity-specific reporting

## 🔐 Authentication Flow

1. **Login Process**
   - User submits credentials
   - Server validates against MongoDB
   - JWT token generated and stored in HTTP-only cookie
   - User redirected to role-appropriate dashboard

2. **Authorization**
   - Middleware validates JWT on protected routes
   - Role-based access control for API endpoints
   - Client-side role checks for UI elements

3. **Session Management**
   - 7-day token expiration
   - Automatic logout on token expiry
   - Secure cookie handling

## 📱 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Student Management
- `GET /api/students` - List students with filters
- `POST /api/students` - Create new student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Club Management
- `GET /api/clubs` - List clubs
- `POST /api/clubs` - Create club
- `POST /api/clubs/[id]/register` - Register for club
- `POST /api/clubs/[id]/unregister` - Unregister from club

### Training Management
- `GET /api/trainings` - List trainings
- `POST /api/trainings` - Create training
- `POST /api/trainings/[id]/register` - Register for training
- `POST /api/trainings/[id]/feedback` - Submit feedback

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: System preference detection
- **Multi-language Support**: Internationalization ready
- **Accessibility**: WCAG compliant components
- **Modern Interface**: Clean, intuitive design patterns

## 🔧 Development Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database Operations
pnpm seed                   # Seed initial data
npx ts-node scripts/seed-admin.ts  # Create super admin user
```

## 📈 Performance Optimizations

- **Server-Side Rendering**: Next.js SSR for faster initial loads
- **Image Optimization**: Next.js built-in image optimization
- **Code Splitting**: Automatic route-based code splitting
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Strategic API response caching

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **HTTP-Only Cookies**: XSS protection for auth tokens
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Granular permission system
- **Input Validation**: Zod schema validation
- **CSRF Protection**: Built-in Next.js CSRF protection

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Deployment Platforms
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Full-stack deployment support
- **Docker**: Containerized deployment
- **Traditional Hosting**: Node.js compatible servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🏗️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with external systems
- [ ] Offline capability
- [ ] Enhanced notification system
- [ ] Multi-tenant architecture improvements

---

**Built with ❤️ for educational institutions worldwide.**
