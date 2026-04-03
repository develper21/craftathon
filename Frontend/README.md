# MediTrack - Medication Adherence System (Frontend)

A modern, responsive **React frontend** for medication adherence tracking with role-based dashboards (Patient, Caregiver, Admin). Built with **Vite, React Router 6, Tailwind CSS**, and **Lucide React** icons.

---

## 🎯 Features Overview

### 👥 Patient Features
- **Dashboard** - Today's medications overview
- **Add Medications** - Easy medication management
- **Schedule** - Calendar-based medication schedule
- **Adherence** - Visual progress tracking
- **Dose Logging** - Quick "Mark as Taken"
- **Notifications** - Real-time alerts
- **Profile** - Account management
- **Login/Signup** - Role-based authentication

### 👨‍⚕️ Caregiver/Doctor Features
- **Dashboard** - Patients overview with alerts
- **Patients List** - Managed patients search & filter
- **Patient Details** - Full medication history & adherence
- **Alerts** - Real-time adherence alerts
- **Reports** - Adherence reports & analytics
- **Notifications** - System notifications
- **Profile** - Caregiver profile management
- **Email Verification** - Secure signup flow

### 🛡️ Admin Features
- **Dashboard** - System metrics & analytics
- **Users Management** - View, activate, deactivate, delete users
- **Alerts** - Global system alerts with severity filters
- **Analytics** - Adherence statistics & trends
- **Settings** - System configuration & preferences
- **Notifications** - Admin notifications
- **Profile** - Admin profile management

---

## 🛠️ Tech Stack

- **React 18.2** - UI library with Hooks
- **React Router 6.20** - Client-side routing
- **Vite 5.0** - Lightning-fast build tool
- **Tailwind CSS 3.3** - Utility-first styling
- **Lucide React 1.7** - Icon library (no emojis!)
- **Context API** - State management

---

## 📦 Installation & Setup

### Prerequisites
- Node.js v18+
- npm or yarn

### Quick Start

1. **Navigate to directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 📁 Project Structure

```
Frontend/
├── index.html                          # HTML entry point
├── package.json                        # Dependencies
├── vite.config.js                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS config
├── postcss.config.js                   # PostCSS config
│
└── src/
    ├── main.jsx                        # React entry point
    ├── App.jsx                         # Root component
    ├── index.css                       # Global styles
    │
    ├── components/                     # Reusable UI components
    │   ├── Navbar.jsx                  # Top navigation bar
    │   ├── Sidebar.jsx                 # Patient sidebar
    │   ├── DashboardLayout.jsx         # Patient layout wrapper
    │   ├── CaregiverLayout.jsx         # Caregiver layout wrapper
    │   ├── AdminLayout.jsx             # Admin layout wrapper
    │   ├── Logo.jsx                    # Logo component
    │   ├── Card.jsx                    # Reusable card
    │   ├── Button.jsx                  # Reusable button
    │   ├── Input.jsx                   # Reusable input
    │   ├── CircleProgress.jsx          # Progress circle
    │   ├── Notification.jsx            # Toast notifications
    │   └── Topbar.jsx                  # Top bar info section
    │
    ├── context/
    │   └── AuthContext.jsx             # Global auth state
    │
    ├── pages/
    │   ├── Auth Pages/
    │   │   ├── Landing.jsx             # Home page
    │   │   ├── Login.jsx               # Login page
    │   │   ├── Signup.jsx              # Registration page
    │   │   ├── VerifyEmail.jsx         # Email verification
    │   │   ├── ForgotPassword.jsx      # Password reset request
    │   │   └── ResetPassword.jsx       # Password reset form
    │   │
    │   ├── Patient Pages/
    │   │   ├── PatientDashboard.jsx    # Patient home page
    │   │   ├── AddMedication.jsx       # Add med form
    │   │   ├── Schedule.jsx            # Schedule view
    │   │   ├── Adherence.jsx           # Adherence stats
    │   │   ├── Profile.jsx             # Patient profile
    │   │   ├── Notifications.jsx       # Patient notifications
    │   │   ├── PatientDetail.jsx       # Doctor view patient
    │   │   └── Alerts.jsx              # Patient alerts
    │   │
    │   ├── Caregiver Pages/
    │   │   ├── CaregiverDashboard.jsx  # Caregiver home
    │   │   ├── CaregiverPatientsList.jsx
    │   │   ├── CaregiverPatientDetail.jsx
    │   │   ├── CaregiverAlerts.jsx     # Adherence alerts
    │   │   ├── CaregiverReports.jsx    # Reports
    │   │   ├── CaregiverProfile.jsx    # Caregiver profile
    │   │   └── CaregiverNotifications.jsx
    │   │
    │   ├── Admin Pages/
    │   │   ├── AdminDashboard.jsx      # Admin home
    │   │   ├── AdminUsers.jsx          # User management
    │   │   ├── AdminAlerts.jsx         # System alerts
    │   │   ├── AdminAnalytics.jsx      # Analytics
    │   │   ├── AdminSettings.jsx       # Settings
    │   │   ├── AdminNotifications.jsx  # Notifications
    │   │   └── AdminProfile.jsx        # Admin profile
    │   │
    │   └── DoctorDashboard.jsx         # Legacy doctor page
    │
    ├── routes/
    │   └── AppRoutes.jsx               # Route definitions
    │
    └── utils/
        └── pushNotifications.js        # Notification helpers
```

---

## 🎨 Design System

### Theme Colors

**Patient/Caregiver Theme:**
- Primary Dark: `#1E3A5F` (blue)
- Caregiver Accent: `#14B8A6` (teal)
- Light Background: `#F9FAFB`

**Admin Theme:**
- Sidebar: `#111827` → `#0F172A` (dark gradient)
- Accent: `#6366F1` (indigo)
- Light Background: `#F9FAFB`

### Design Principles
- Tailwind CSS utility-first
- `rounded-xl` / `rounded-3xl` for cards
- `shadow-sm` / `shadow-md` for depth
- Mobile-first responsive design
- No emojis - Lucide React icons only
- Consistent spacing (gap-3, p-6, etc.)

---

## 🔐 Authentication Flow

### User Roles
1. **Patient** - Can track own medications
2. **Caregiver/Doctor** - Can monitor patient adherence
3. **Admin** - Can manage users and system

### Login Process
```
1. User enters email + password
2. Submit to /api/auth/login
3. Server returns JWT token
4. Token stored in localStorage
5. Available in Authorization header
6. Redirects to role-specific dashboard
```

### Protected Routes
- Patient routes require `role === 'patient'`
- Caregiver routes require `role === 'doctor'`
- Admin routes require `role === 'admin'`
- All protected by `<ProtectedRoute>` wrapper

---

## 📱 Responsive Design

- **Mobile** (375px) - Full vertical layout
- **Tablet** (768px) - Side-by-side components
- **Desktop** (1024px+) - Multi-column layouts

All components tested on:
- iPhone 12/13/14/15
- iPad Pro
- Desktop monitors

---

## 🧭 Routing Structure

### Public Routes
```
/              → Landing page
/login         → Login page
/signup        → Signup page
/verify-email/:token → Email verification
/forgot-password → Password reset request
/reset-password/:token → Password reset
```

### Patient Routes (Protected)
```
/dashboard     → Home (medications today)
/add-medication → Add new medication
/schedule      → Calendar view
/adherence     → Statistics & trends
/profile       → Profile management
/notifications → Notifications
/alerts        → Health alerts
```

### Caregiver Routes (Protected)
```
/caregiver/dashboard → Home
/caregiver/patients → Patient list
/caregiver/patient/:id → Patient details
/caregiver/alerts → Adherence alerts
/caregiver/reports → Reports
/caregiver/profile → Profile
/caregiver/notifications → Notifications
```

### Admin Routes (Protected)
```
/admin/dashboard → System dashboard
/admin/users → User management
/admin/alerts → System alerts
/admin/analytics → Analytics
/admin/settings → Configuration
/admin/notifications → Notifications
/admin/profile → Profile
```

---

## 📊 Key Components

### DashboardLayout (Patient)
- Fixed sidebar with patient menu
- Topbar with greeting + notifications + profile
- Main content area with Outlet for pages

### CaregiverLayout
- Fixed sidebar with caregiver menu
- Topbar with greeting + notifications + profile
- Color scheme: Teal accents (#14B8A6)

### AdminLayout
- Fixed sidebar with admin menu (dark gradient)
- Topbar with greeting + notifications + profile
- Color scheme: Indigo accents (#6366F1)

### Card Component
- Reusable white card with border
- Shadow on hover
- Accepts children and styling props

### CircleProgress Component
- Visual adherence percentage
- Animated progress circle
- Color-coded (green/yellow/red)

---

## 🎯 Page Features

### PatientDashboard
- Today's medications list
- Quick dose logging buttons
- Adherence summary card
- Recent activity feed

### Adherence Page
- Monthly adherence percentage
- Weekly trends chart
- Medication breakdown
- Progress indicators

### CaregiverDashboard
- Patient overview cards
- Adherence alerts list
- Recent activity
- Quick stats

### AdminDashboard
- System metrics cards
- Recent activity feed
- System health metrics
- Quick summary

---

## 🔄 State Management

### AuthContext
- Global auth state (user, token, role)
- Login/Logout functions
- Auto-redirect on login
- Protected route checking

### Local Storage
- JWT token persistence
- User role on refresh
- Session recovery

---

## 🧪 Sample Test Credentials

After seeding backend:
```
Patient:
  Email: patient@example.com
  Password: password123

Caregiver:
  Email: caregiver@example.com
  Password: password123

Admin:
  Email: admin@example.com
  Password: admin123
```

---

## 📦 NPM Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## 🎨 Styling Examples

### Button
```jsx
<button className="px-6 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-indigo-700 transition">
  Save
</button>
```

### Card
```jsx
<div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-md hover:shadow-lg transition-all">
  {/* content */}
</div>
```

### Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* items */}
</div>
```

---

## 🐛 Troubleshooting

### Blank white page
- Clear browser cache (Ctrl+Shift+Delete)
- Check console for errors (F12)
- Verify API endpoint is correct

### Login fails
- Check backend is running on http://localhost:5000
- Verify email + password in test account
- Check browser console for error details

### Tailwind styles not applying
- Ensure `npm install` completed
- Restart dev server: `npm run dev`
- Check `tailwind.config.js` includes correct paths

### Routes not working
- Verify role in `/caregiver` or `/admin` routes
- Check AuthContext has correct role value
- Ensure ProtectedRoute wrapper has requiredRole prop

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Connect GitHub repository
2. Set environment variables in Vercel
3. Set build command: `npm run build`
4. Deploy!

### Deploy to Netlify
1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Update API Endpoint
Before deployment, update API base URL:
- Find: `API_URL` in code
- Change: `http://localhost:5000` → production backend URL

---

## 📚 Documentation

- [React Documentation](https://react.dev)
- [React Router Docs](https://reactrouter.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/NewFeature`
2. Commit changes: `git commit -m 'Add NewFeature'`
3. Push: `git push origin feature/NewFeature`
4. Open Pull Request

---

**Last Updated**: April 2026

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**

   ```bash
   cd Frontend
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:3000`

3. **Build for Production**

   ```bash
   npm run build
   ```

4. **Preview Production Build**

   ```bash
   npm run preview
   ```

## 📱 Routes & Navigation

### Public Routes

- `/` - Landing page
### Caregiver Routes (Protected - role: doctor)
- `/caregiver/dashboard` - Caregiver home & patient overview
- `/caregiver/patients` - Patients list & management
- `/caregiver/alerts` - Patient alerts & notifications
- `/caregiver/reports` - Adherence reports & analytics
- `/caregiver/profile` - Caregiver profile & settings

### Patient Routes (Protected)

- `/dashboard` - Patient home
- `/add-medication` - Add new medication
- `/schedule` - View medication schedule
- `/adherence` - View adherence statistics

### Doctor Routes (Protected)
<<<<<<< Updated upstream

- `/doctor-dashboard` - Doctor home
- `/patient/:patientId` - Patient details
- `/alerts` - Patient alerts

### Shared Routes (Protected)

- `/profile` - User profile and settings

=======
- `/patient/:patientId` - Patient details
- `/alerts` - Patient alerts

>>>>>>> Stashed changes
## 🔐 Authentication

The app uses a simple context-based authentication system:

- **Login**: Users can login as Patient or Doctor
- **Role-based Access**: Different routes for different roles
- **Protected Routes**: Automatic redirect to login if not authenticated
- **Local Storage**: Auth state persists across page refreshes

### Demo Credentials

- **Email**: Any valid email format (e.g., `demo@example.com`)
- **Password**: Any password (6+ characters)

## 🧩 Key Components

### Navbar

- Logo and branding
- Navigation links
- User info display
- Logout button

### Card

- Reusable container component
- Claymorphism styling
- Optional click handler
- Consistent spacing

### Button

- Primary and Secondary variants
- Hover and active states
- Loading states support
- Full width option

### Input

- Text, email, password fields
- Label support
- Required field indicators
- Validation styling

### CircleProgress

- Animated progress circles
- Customizable size and color
- Percentage display
- Smooth transitions

## 🎯 User Flows

### Patient Flow

1. Sign up or Login
2. Access dashboard with today's medications
3. Add or manage medications
4. Log doses as taken
5. View adherence statistics
6. Edit profile and preferences

### Doctor Flow

1. Login as Doctor
2. View list of patients
3. Check individual patient details
4. Review medication adherence
5. Monitor missed doses
6. Send alerts and reminders

## 🔧 Customization

### Change Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  'primary-dark': '#205658',
  'primary-blue': '#0066FC',
  'light-bg': '#ACD8FF',
}
```

### Add New Pages

1. Create component in `src/pages/`
2. Add route in `src/routes/AppRoutes.jsx`
3. Update navigation if needed

### Modify Styling

- Global styles in `src/index.css`
- Component-specific: Use Tailwind classes
- Customize theme in `tailwind.config.js`

## 📦 Dependencies

- `react`: UI library
- `react-dom`: React DOM rendering
- `react-router-dom`: Routing library
- `tailwindcss`: CSS framework
- Development tools: Vite, PostCSS, Autoprefixer

## 🚨 Important Notes

- This is a frontend-only implementation
- All data is currently mocked (localStorage for auth)
- Connect to a backend API for real functionality
- Implement proper API integration in the pages
- Add form validation and error handling

## 🔄 Backend Integration

To connect with a backend:

1. Replace mock data in pages with API calls
2. Use `fetch` or `axios` in effect hooks
3. Handle loading and error states
4. Update authentication to use real tokens
5. Implement proper session management

## 📝 Environment Variables

Create a `.env.local` file for environment-specific configs:

```txt
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=MediTrack
```

## 🤝 Contributing

1. Keep components modular and reusable
2. Follow the existing code style
3. Add proper comments for complex logic
4. Test responsive design on multiple devices
5. Update this README for new features

## 📄 License

This project is part of a HealthTech Hackathon solution.

---

**Built with ❤️ for better medication adherence and healthcare outcomes.**
