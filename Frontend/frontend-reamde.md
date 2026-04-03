# 💊 Medication Non-Adherence System – Frontend

## 🚀 Project Overview

This project is developed as part of **Craftathon (Hackathon)** under the **HealthTech theme**.

The goal is to solve the real-world problem of **Medication Non-Adherence**, where patients often forget or skip their prescribed medicines, leading to serious health risks.

This frontend application provides a simple and user-friendly interface for patients and caregivers to manage and monitor medication effectively.

---

## 🎯 Problem Statement

**Medication Non-Adherence**

Common issues:

* Patients miss doses
* Incorrect timing of medicines
* Lack of monitoring

👉 Our solution:
A smart system that helps users to:

* Track medicine intake
* Get reminders
* Monitor adherence

---

## 🧩 Frontend Scope (What We Built)

The frontend focuses on **user interaction, tracking, and visualization**.

---

## 🌐 1. Landing Page (Public Access)

* Introduction to the system
* Problem explanation
* Features overview
* Navigation to Login / Signup

---

## 🔐 2. Authentication System

### Login Page

* Email & password login

### Signup Page

* User registration
* Role selection:

  * Patient
  * Caregiver

---

## 🔄 3. Role-Based Navigation

After login, users are redirected based on their role:

* **Patient → Patient Dashboard**
* **Caregiver → Caregiver Dashboard**

---

## 👤 4. Patient Panel

### 📊 Dashboard

* View daily medicines
* Track status:

  * ✅ Taken
  * ❌ Missed
* Adherence percentage

---

### 💊 Add Medicine

* Add medicine details:

  * Name
  * Time
  * Dosage

---

### ⏰ Reminder Interface

* UI alerts for medicine timing
* Action buttons for marking medicine status

---

### 📈 Reports

* Weekly adherence tracking
* Basic visual insights (charts/progress)

---

## 👨‍👩‍👧 5. Caregiver Panel (Key Feature ⭐)

### 📊 Dashboard

* Monitor patient status
* View adherence data

### 🔔 Alerts

* Notifications for missed doses

---

## 🧠 Key Functionalities

* Role-based UI rendering
* Clean and responsive design
* Easy navigation
* Real-time updates via backend APIs

---

## 🛠️ Tech Stack

* React.js / React Native
* Tailwind CSS / CSS
* React Router
* Axios

---

## 📂 Folder Structure

```bash
src/
  components/
  pages/
    LandingPage.jsx
    Login.jsx
    Signup.jsx

    patient/
      Dashboard.jsx
      AddMedicine.jsx
      Reports.jsx

    caregiver/
      Dashboard.jsx
      Alerts.jsx
```

---

## 🔗 API Integration

Frontend interacts with backend APIs for:

* Authentication
* Medicine management
* Tracking logs
* Adherence calculation

---

## ⚡ Future Enhancements

* Push notifications
* Voice reminders
* AI-based insights
* WhatsApp/SMS alerts

---

## 🏁 Conclusion

This frontend system is designed to provide a **simple, effective, and scalable solution** for improving medication adherence by combining:

* Tracking
* Reminders
* Monitoring

---

## 👨‍💻 Hackathon Project

Developed during **Craftathon Hackathon** 🚀
