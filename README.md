<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="App Logo" />
</p>

<p align="center">
  <b>Room Booking & Notification Service</b> — a NestJS backend application for managing room bookings, sending real-time notifications, and automated email reminders before scheduled meetings.
</p>

<p align="center">
<a href="https://www.typescriptlang.org/" target="_blank"><img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" /></a>
<a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/NestJS-Framework-red" alt="NestJS" /></a>
<a href="https://nodejs.org/" target="_blank"><img src="https://img.shields.io/badge/Node.js-18-green" alt="Node.js" /></a>
<a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/PostgreSQL-Database-blue" alt="PostgreSQL" /></a>
<a href="https://socket.io/" target="_blank"><img src="https://img.shields.io/badge/WebSockets-Socket.IO-yellow" alt="WebSockets" /></a>
</p>

---

## 📜 Description

This project is a **NestJS** application for booking meeting rooms, managing schedules, and sending notifications to users both via **WebSockets** and **email**.  
It ensures users are reminded **exactly 30 minutes before** their meetings and sends only **one email per booking**.

---

## ✨ Features

- 🏢 **Room booking management**
  - CRUD for rooms and bookings
  - Metadata support (projector, microphone, notes)
- 🔔 **Real-time notifications**
  - WebSocket integration for instant alerts
- 📧 **Email reminders**
  - Sent automatically 30 minutes before the event
- ⏳ **Scheduled jobs**
  - Cron-based background checks
- 🗄 **PostgreSQL + Prisma**
  - Cascade deletes for related entities

---

## 🛠 Tech Stack

| Layer       | Technology |
|-------------|------------|
| Backend     | NestJS |
| Database    | PostgreSQL |
| ORM         | Prisma |
| Real-time   | Socket.IO |
| Email       | Nodemailer |
| Scheduler   | @nestjs/schedule |
| Language    | TypeScript |

---

## 📂 Project Structure


src/


  ├── bookings/         # Booking logic and controllers

  ├── notifications/    # Notification services (email, WebSocket)

  ├── rooms/            # Room management

  ├── users/            # User management

  ├── email/            # Email sending with nodemailer

  ├── auth/             # Authentication and authorization
  
└── app.module.ts     # Root application module

└── main.ts             # Application entry point



---

## 📦 Installation

```bash
$ npm install

# Development
$ npm run start

# Watch mode
$ npm run start:dev

# Production
$ npm run start:prod

🧪 Testing

# Launch all tests
$ npm run test

# Launch all tests in watch mode
$ npm run test:watch

# Run tests with code coverage report
$ npm run test:cov

# Run e2e tests (integration tests)
$ npm run test:e2e

