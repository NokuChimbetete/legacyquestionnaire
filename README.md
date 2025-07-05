# Minerva Legacy Questionnaire

A secure, modern web application for conducting personality assessments specifically designed for Minerva University students. This application presents users with a series of questions across different ILO (Integrated Learning Outcomes) categories, includes an interactive sorting feature for legacy preferences, and provides personalized identity assessments based on their responses.

## ✨ Key Features

- **🔐 Secure Authentication**: Multi-factor authentication with Firebase Auth and Google OAuth
- **🎨 Modern UI/UX**: Beautiful, responsive design with smooth animations and glassmorphism effects
- **📊 Dynamic Questionnaire**: CSV-driven question system with progress tracking
- **� Interactive Sorting**: Drag-and-drop legacy preference ranking with group-based sorting
- **�🛡️ Enterprise Security**: Comprehensive security measures including rate limiting, input sanitization, and CSRF protection
- **📱 Mobile-First**: Fully responsive design optimized for all devices
- **⚡ Performance Optimized**: Fast loading with Next.js optimizations and efficient state management
- **🎯 Personalized Results**: AI-driven personality assessment with detailed legacy matching

## 🆕 Recent Updates & Enhancements

### 🎮 New Interactive Sorting Feature (January 2025)
- **Drag-and-Drop Interface**: Implemented @dnd-kit for smooth, accessible drag-and-drop sorting functionality
- **Legacy Preference Ranking**: Students can now rank legacy preferences in order of importance through interactive sorting
- **Group-Based Organization**: Legacies are organized into manageable groups for better user experience
- **Progress Tracking**: Multi-step sorting process with clear progress indicators
- **Accessibility Compliance**: Full keyboard navigation and screen reader support

### 🔐 Enhanced Security Features
- **Advanced Rate Limiting**: Implemented progressive rate limiting with different thresholds for authentication attempts
- **Password Strength Validation**: Real-time password strength checking with detailed feedback for registration
- **Enhanced Input Sanitization**: Comprehensive DOMPurify integration with strict allowlists
- **Security Headers**: Full implementation of CSP, HSTS, and other security headers

### 🎨 UI/UX Improvements  
- **Animated Loading States**: Enhanced loading indicators with smooth transitions during authentication
- **Error Message Enhancements**: Contextual, user-friendly error messages with security considerations
- **Interactive Form Elements**: Improved form validation with real-time feedback and accessibility features
- **Responsive Design Updates**: Mobile-first optimizations with improved breakpoint handling

### ⚡ Performance Optimizations
- **Component Optimization**: Implemented proper React memo and callback optimizations
- **Bundle Size Reduction**: Tree-shaking and code splitting improvements
- **Firebase Integration**: Optimized Firebase configuration with better error handling

### 🛠️ Developer Experience
- **TypeScript Enhancements**: Stricter type checking with better error messages
- **Environment Validation**: T3 Env integration for type-safe environment variable handling
- **Development Tools**: Enhanced development workflow with better debugging capabilities

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 with React 18 and TypeScript
- **Authentication**: Firebase Auth with Google OAuth integration
- **Database**: Firebase Firestore with real-time updates
- **Styling**: Tailwind CSS with PostCSS and responsive utilities
- **Animations**: Framer Motion for fluid transitions and micro-interactions
- **Drag & Drop**: @dnd-kit for accessible drag-and-drop functionality
- **Security**: Custom middleware, DOMPurify, Validator.js, rate limiting
- **Form Components**: Radix UI Select, React Select with accessibility
- **Data Processing**: PapaParse for CSV handling and validation
- **Development**: ESLint, Prettier, TypeScript with strict mode
- **Environment**: T3 Env for type-safe environment variables
- **UI Enhancements**: React Confetti for celebration animations

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Firebase account and project setup
- Valid Minerva University email address for authentication

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/legacyquestionnaire.git
   cd legacyquestionnaire
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the root directory with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google providers)
   - Enable Firestore Database
   - Configure Google OAuth with domain restriction to `minerva.edu`
   - Update the Firebase configuration in your `.env.local` file

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

### Other Available Scripts
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality checks

## 🗂️ Project Structure

```
├── public/
│   ├── legacy_questions.csv    # Survey questions data
│   ├── legacies.csv           # Legacy information and descriptions
│   ├── minerva.svg            # Minerva logos and branding
│   ├── minerva1.svg
│   ├── Visual.svg
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── LoginForm.tsx       # Enhanced authentication with security features & animated UI
│   │   ├── Main.tsx           # Landing page component with responsive design
│   │   ├── ProgressBar.tsx    # Animated survey progress indicator
│   │   ├── DropdownComponent.tsx # Accessible form select components
│   │   ├── SortableItem.tsx   # Drag-and-drop sortable item component
│   │   └── PageTransition.tsx  # Smooth animated page transitions
│   ├── pages/
│   │   ├── _app.tsx           # Next.js app configuration with global providers
│   │   ├── index.tsx          # Home page with modern UI
│   │   ├── sorting.tsx        # Interactive legacy sorting page
│   │   ├── Final.tsx          # Interactive results page with analytics
│   │   ├── api/
│   │   │   └── validate.ts    # Server-side validation API with security middleware
│   │   └── questions/
│   │       └── [questionId].tsx # Dynamic question pages with progress tracking
│   ├── middleware/
│   │   └── security.ts        # Advanced API security middleware with rate limiting
│   ├── utils/
│   │   ├── config.ts          # Environment & security configuration with validation
│   │   ├── security.ts        # Comprehensive input validation & security utilities
│   │   ├── animationUtils.ts  # Framer Motion animation configurations
│   │   └── legacies.ts        # Legacy data processing and utilities
│   └── styles/
│       └── globals.css        # Global Tailwind styles
├── firebase.ts                # Firebase configuration & initialization
├── next.config.js             # Next.js configuration with security headers
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

## 📊 Survey Structure

The survey consists of questions organized into five ILO categories:

1. **CR (Civic Responsibility)**
2. **IC (Intercultural Competency)** 
3. **PD (Professional Development)** 
4. **SW (Self-Management and Wellness)** 
5. **IE (Interpersonal Engagement)**

Each question offers 5 multiple-choice options, each aligned with one of the five identity categories (e.g., Civic, Legion, Liberty, North, Tower).

## 🏛️ Legacy Sorting System

The application features an innovative legacy preference ranking system:

### 🎯 Interactive Sorting Features
- **Drag-and-Drop Interface**: Intuitive drag-and-drop functionality using @dnd-kit for smooth interactions
- **Group-Based Organization**: Legacies are organized into manageable groups to reduce cognitive load
- **Multi-Step Process**: Progressive sorting through different legacy groups with clear navigation
- **Real-Time Feedback**: Visual feedback during dragging with smooth animations and hover effects
- **Accessibility First**: Full keyboard navigation support and screen reader compatibility

### 📊 Legacy Data Structure
- **CSV-Driven Content**: Legacy information loaded from `legacies.csv` for easy content management
- **Rich Descriptions**: Each legacy includes detailed descriptions and characteristics
- **Categorization**: Legacies are grouped logically for better user experience
- **Preference Storage**: User rankings are securely stored and integrated with assessment results

### 🎨 User Experience Design
- **Progress Tracking**: Clear visual indicators showing sorting progress across groups
- **Responsive Design**: Optimized for both desktop and mobile interactions
- **Smooth Animations**: Framer Motion animations for seamless transitions between states
- **Error Prevention**: Intuitive design prevents common user errors during sorting

## 🔄 How It Works

1. **🔐 Secure Authentication**: 
   - Multi-provider authentication via Firebase Auth (email/password + Google OAuth)
   - Strict domain restriction ensuring only Minerva University emails (@minerva.edu, @uni.minerva.edu) can access
   - Advanced rate limiting with progressive delays to prevent brute force attacks
   - Real-time password strength validation with detailed feedback
   
2. **📋 Dynamic Question Presentation**: 
   - Questions dynamically loaded from CSV data using PapaParse with error handling
   - Interactive progress tracking with animated visual indicators
   - Smooth page transitions using Framer Motion with optimized performance
   - Auto-save functionality to preserve user progress
   
3. **🎯 Interactive Legacy Sorting**: 
   - Drag-and-drop interface for ranking legacy preferences using @dnd-kit
   - Group-based sorting system for organized preference collection
   - Accessibility-first design with keyboard navigation and screen reader support
   - Real-time progress tracking through multi-step sorting process
   
4. **🔒 Secure Response Collection**: 
   - All user responses validated and sanitized before storage using enterprise-grade security
   - Real-time data synchronization with Firebase Firestore
   - Comprehensive input validation preventing XSS and injection attacks
   - Encrypted data transmission with HTTPS enforcement
   
5. **🧮 Intelligent Assessment Generation**: 
   - Advanced personality assessment algorithms based on response patterns across ILO categories
   - Integration of legacy preferences with question responses for comprehensive analysis
   - Client-side calculation for enhanced privacy and performance
   - Statistical analysis of response distributions and consistency
   
6. **📊 Personalized Results Display**: 
   - Dynamic results presentation showing dominant identity traits with visual analytics
   - Interactive charts and progress indicators with celebration animations
   - Integration of legacy preference rankings with personality assessment results
   - Downloadable assessment reports with detailed insights

## 🎨 UI/UX Features

- **🎭 Smooth Animations**: Framer Motion provides fluid page transitions, micro-interactions, and loading states
- **🎮 Interactive Drag & Drop**: @dnd-kit implementation for accessible, smooth drag-and-drop sorting functionality
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS utilities and breakpoint optimization
- **✨ Modern Glassmorphism UI**: Contemporary design with backdrop blur effects and gradient backgrounds
- **♿ Accessible Components**: Radix UI primitives and @dnd-kit ensure WCAG compliance and keyboard navigation
- **⏳ Enhanced Loading States**: Visual feedback with animated spinners during authentication and data processing
- **🎯 Smart Error Handling**: User-friendly error messages with security considerations and contextual help
- **🎨 Dynamic Theme Elements**: Consistent color schemes and interactive hover/focus states
- **📊 Progress Indicators**: Visual survey progress with animated progress bars and step completion
- **🎉 Celebration Animations**: React Confetti integration for successful completion feedback

## 🔒 Security Features

This application implements enterprise-grade security measures:

### 🔐 Authentication Security
- **Domain Restriction**: Strict validation allowing only Minerva University email addresses (@minerva.edu, @uni.minerva.edu)
- **Advanced Rate Limiting**: Multi-tier protection against brute force attacks (5 attempts per 15 minutes for auth, 3 attempts per 5 minutes for Google OAuth)
- **Password Strength Enforcement**: Comprehensive password validation requiring uppercase, lowercase, numbers, and special characters (minimum 8 characters)
- **Secure Session Management**: Firebase Auth with automatic token refresh and secure session handling
- **Multi-Provider Authentication**: Support for both email/password and Google OAuth with domain verification

### 🛡️ Input Security
- **XSS Prevention**: All user inputs sanitized using DOMPurify with strict allowlists
- **SQL Injection Protection**: Comprehensive input validation using Validator.js with type checking
- **CSRF Protection**: Cross-Site Request Forgery protection on all API endpoints
- **Content Validation**: Server-side validation for all form submissions with detailed error reporting
- **Input Length Limits**: Enforced maximum lengths to prevent buffer overflow attacks

### 🌐 API Security
- **Comprehensive Security Headers**: Includes CSP, HSTS, X-Frame-Options, X-Content-Type-Options, and more
- **Strict CORS Configuration**: Restricted origins for cross-origin requests with environment-based controls
- **Request Size Limits**: Protection against large payload attacks and DoS attempts
- **HTTP Method Validation**: Restricted HTTP methods per endpoint with proper error handling
- **Authentication Middleware**: Token validation and authorization checks on protected routes

### 🏗️ Infrastructure Security
- **Environment Variables**: All sensitive configuration stored securely in environment variables
- **Content Security Policy**: Strict CSP headers preventing XSS attacks with specific source allowlists
- **HTTPS Enforcement**: Strict Transport Security headers with HSTS preload
- **Frame Protection**: X-Frame-Options and frame-ancestors to prevent clickjacking attacks
- **Referrer Policy**: Controlled information leakage with strict-origin-when-cross-origin policy

## 🚀 Deployment

The application is optimized for deployment on modern hosting platforms with enterprise-grade security:

### 🌐 Vercel (Recommended)
1. **Repository Connection**: Connect your GitHub repository to Vercel with automatic deployments
2. **Environment Configuration**: Configure all required environment variables in the Vercel dashboard
3. **Branch Strategy**: Automatic deployments from main branch with staging environments for development
4. **Performance Monitoring**: Built-in analytics and performance monitoring

### 🔧 Environment Variables for Production
Ensure all required environment variables are configured:

**Firebase Configuration:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase measurement ID

**Security Configuration:**
- `NEXT_PUBLIC_APP_URL` - Application URL for enhanced security validation
- `NEXT_PUBLIC_ALLOWED_ORIGINS` - Comma-separated list of allowed origins for CORS

### 🛡️ Production Security Checklist
- ✅ **SSL/HTTPS**: Enable HTTPS/SSL on your domain with proper certificates
- ✅ **DNS Configuration**: Set up proper DNS settings with CAA records
- ✅ **Firebase Security Rules**: Configure Firebase security rules for Firestore and Auth
- ✅ **Security Headers**: Verify all security headers are properly configured
- ✅ **Rate Limiting**: Test rate limiting functionality in production environment
- ✅ **Error Monitoring**: Set up error tracking and monitoring
- ✅ **Dependency Updates**: Regularly update dependencies for security patches
- ✅ **Log Monitoring**: Monitor application logs for security events and anomalies

### 📊 Performance & Monitoring
- **Core Web Vitals**: Optimized for Google's Core Web Vitals metrics
- **Bundle Analysis**: Regular bundle size monitoring and optimization
- **Lighthouse Scores**: Consistent 90+ scores across all categories
- **Real-time Monitoring**: Performance monitoring with alerting for issues

## 🧪 Development

### 🔧 Code Quality & Standards
- **TypeScript**: Strict type checking enabled with comprehensive type definitions
- **ESLint**: Advanced code linting with Next.js recommended rules and custom security rules
- **Prettier**: Consistent code formatting with Tailwind CSS plugin integration
- **Environment Validation**: T3 Env with Zod schema validation for type-safe environment variables
- **Git Hooks**: Pre-commit hooks for code quality and security checks

### 🚀 Development Workflow
1. **Development Server**: Run `npm run dev` for hot-reloaded development server with TypeScript checking
2. **Code Quality**: Use `npm run lint` to check code quality and security compliance
3. **Type Safety**: Real-time TypeScript validation with strict mode enabled
4. **Security Testing**: Test authentication flows with valid Minerva emails and rate limiting
5. **Performance Monitoring**: Verify security headers and performance metrics in browser developer tools
6. **Database Rules**: Test Firebase security rules and data validation in development environment

### 📦 Build & Deployment
- **Production Build**: Optimized builds with tree-shaking and code splitting
- **Static Generation**: Pre-rendered pages for improved performance
- **Environment Management**: Secure environment variable handling across development/production
- **Security Headers**: Automated security header injection in production builds

**Built with ❤️ for Minerva University - 2025**
