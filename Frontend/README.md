# MediTrack - Medication Adherence System Frontend

A modern, responsive React frontend for a medication adherence tracking system with claymorphism design. Built with Vite, React Router, and Tailwind CSS.

## 🎯 Features

### Patient Features

- **Medication Dashboard** - View today's medications at a glance
- **Add Medications** - Easy medication management with dosage and frequency
- **Schedule View** - Calendar and list-based medication scheduling
- **Adherence Tracking** - Visual progress circles and monthly trends
- **Dose Logging** - Quick "Mark as Taken" functionality with timestamps
- **Streak Counter** - Motivation through consistency tracking

### Doctor/Caregiver Features

- **Patient Management** - Monitor multiple patients' adherence
- **Real-time Alerts** - Get notified of missed doses
- **Patient Details** - Comprehensive view of each patient's medication history
- **Adherence Dashboard** - Compare and track patient adherence rates
- **Missed Dose Tracking** - Identify and follow up on missed medications

### UI/UX Features

- **Claymorphism Design** - Soft, modern 3D aesthetic
- **Responsive Design** - Mobile-first approach works on all devices
- **Authentication** - Role-based login (Patient/Doctor)
- **Real-time Notifications** - Toast notifications for user actions
- **Protected Routes** - Secure pages with role-based access control

## 🛠️ Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript (ES6+)** - No TypeScript required

## 📁 Project Structure

```txt
Frontend/
├── index.html              # HTML entry point
├── package.json            # Dependencies & scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vite.config.js          # Vite configuration
├── .gitignore              # Git ignore rules
│
└── src/
    ├── main.jsx            # React app entry point
    ├── App.jsx             # Root component with routing
    ├── index.css           # Global styles
    │
    ├── context/
    │   └── AuthContext.jsx # Authentication state management
    │
    ├── components/         # Reusable components
    │   ├── Navbar.jsx      # Navigation bar
    │   ├── Button.jsx      # Reusable button component
    │   ├── Input.jsx       # Reusable input component
    │   ├── Card.jsx        # Card layout component
    │   ├── CircleProgress.jsx # Progress circle component
    │   └── Notification.jsx # Toast notification component
    │
    ├── pages/              # Page components
    │   ├── Landing.jsx     # Landing page
    │   ├── Login.jsx       # Login page
    │   ├── Signup.jsx      # Signup page
    │   ├── PatientDashboard.jsx # Patient home
    │   ├── AddMedication.jsx    # Add medication form
    │   ├── Schedule.jsx    # Medication schedule
    │   ├── Adherence.jsx   # Adherence stats
    │   ├── Profile.jsx     # User profile
    │   ├── DoctorDashboard.jsx  # Doctor home
    │   ├── PatientDetail.jsx    # Patient detail for doctors
    │   └── Alerts.jsx      # Doctor alerts
    │
    └── routes/
        └── AppRoutes.jsx   # Route definitions & protection
```

## 🎨 Design System

### Color Palette

- **Primary Dark**: `#205658` - Headers, primary text
- **Primary Blue**: `#0066FC` - Buttons, links, interactive elements
- **Light Background**: `#ACD8FF` - Page background
- **White**: `#FFFFFF` - Card backgrounds, contrast

### Styling Features

- **Border Radius**: 20px+ for all components (Claymorphism)
- **Shadows**: Soft 3D shadows for depth
- **Spacing**: Consistent padding and margins
- **Hover Effects**: Interactive feedback on buttons and cards
- **Responsive**: Mobile-first design approach

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
