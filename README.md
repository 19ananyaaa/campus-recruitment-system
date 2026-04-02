# 🎓 Campus Recruitment System

## 📌 Overview

Campus Recruitment System ek full-stack web application hai jo campus placement process ko digital aur efficient banata hai.
Is system me students jobs ke liye apply kar sakte hain, events me enroll kar sakte hain aur resources access kar sakte hain, jabki admin poore recruitment process ko manage karta hai.

---

## 🚀 Features

### 👨‍🎓 Student Panel

* View available job opportunities
* Apply for jobs
* Track application status (Applied → Shortlisted → Rejected)
* Enroll in events & hackathons
* Access learning resources
* Personalized dashboard

---

### 🛠️ Admin Panel

* Add / Edit / Delete job opportunities
* Manage recruitment pipeline
* View student applications
* Schedule interviews
* Manage events and enrollments
* Upload and manage resources
* View student profiles

---

## 🧠 Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: PHP
* Database: MySQL
* Server: XAMPP
* Version Control: Git & GitHub

---

## 📂 Project Structure

```
Campus/
│
├── frontend/
├── backend/
│   ├── add_event.php
│   ├── add_opportunity.php
│   ├── get_events.php
│   ├── get_resources.php
│   ├── login.php
│   ├── signup.php
│   └── db.php
│
├── database/
│   └── schema.sql
│
└── uploads/
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```
git clone https://github.com/your-username/campus-recruitment-system.git
cd campus-recruitment-system
```

---

### 2️⃣ Setup XAMPP

* Install XAMPP
* Start **Apache** and **MySQL**

---

### 3️⃣ Move Project

Project ko move karo:

```
C:\xampp\htdocs\
```

---

### 4️⃣ Setup Database

* Open **phpMyAdmin**
* Create database (e.g., `campus_db`)
* Import `schema.sql`

---

### 5️⃣ Configure Database

`db.php` file me credentials update karo:

```php
$conn = mysqli_connect("localhost", "root", "", "campus_db");
```

---

### 6️⃣ Run Project

Browser me open karo:

```
http://localhost/Campus/
```

---

## 📸 Screenshots

(Add screenshots yaha for better presentation)

---

## 🔐 Key Functionalities

* Role-based login system (Admin / Student)
* Job application tracking system
* Event enrollment system
* Resource sharing platform
* Interview scheduling system

---

## 📊 Future Enhancements

* AI-based job recommendation
* Resume upload & parsing
* Email notifications
* Mobile responsive improvements
* Advanced analytics dashboard

---

## 👩‍💻 Author

**Ananya Agarwal**
B.Tech CSE (Core)

---

## ⭐ GitHub Repository

👉 https://github.com/your-username/campus-recruitment-system

---

## 📌 Note

This project is developed for academic purposes and can be extended for real-world recruitment systems.
