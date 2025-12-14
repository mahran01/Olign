# OLIGN: MOBILE SOLUTION FOR TASK COLLABORATION AND COMMUNICATION

**Olign** is a mobile application designed for university students that unifies **real-time communication** and **task management** into a single platform. It enables students to collaborate on group projects, assign and track tasks directly within conversations, and manage academic workflows more effectively.

This project was developed as a **Final Year Project** for the Bachelor of Information Technology (Hons) in Software Engineering at **Universiti Kuala Lumpur (UniKL) - Malaysian Institute of Information Technology (MIIT)**.

## 📑 Table of Contents

1. [Olign](#olign)
2. [🎥 Introduction Video](#-introduction-video)
3. [✨ Core Features](#-core-features)
4. [🏗 Technical Overview](#-technical-overview)
5. [👀 UI Walkthrough](#-ui-walkthrough)
6. [⚠️ Setup & Development Notice](#️-setup--development-notice)
   1. [What this repository includes](#what-this-repository-includes)
   2. [What this repository does NOT include](#what-this-repository-does-not-include)
7. [🧠 Architectural Note](#-architectural-note)
8. [🎓 Academic Context](#-academic-context)
9. [🔮 Future Enhancements](#-future-enhancements)
10. [👨‍💻 Author](#-author)
11. [📄 License](#-license)

## 🎥 Introduction Video

Watch a short introduction of Olign’s features on YouTube:

▶️ **[Olign – UI & Feature Introduction](https://youtu.be/5RNWuiwzSic)**

## ✨ Core Features

- 🔐 **Authentication & Security**

  - Email-based authentication with verification
  - Secure session handling via Supabase

- 👤 **User Profiles**

  - Custom username, display name, and avatar

- 💬 **Real-time Messaging**

  - Direct and group chats
  - Text, images, attachments, and audio messages
  - Message replies, reactions, and threads
  - Powered by Stream Chat

- ✅ **Task Collaboration**

  - Create tasks directly inside chats
  - Individual and group tasks
  - Milestones, due dates, assignees, and status tracking

- 👥 **Friends & Groups**

  - Friend requests and management
  - Group creation with admin controls

- 🔔 **Notifications**

  - Messages, task updates, deadlines, and friend requests

- 📱 **Mobile-first UI**
  - Responsive cross-platform mobile design using Tamagui

## 👀 UI Walkthrough

For a visual, no-setup overview of Olign’s user interface and interactions, see:

➡️ **[UI & Interaction Overview](./.github/UI_OVERVIEW.md)**

## 🏗 Technical Overview

**Frontend**

- React Native with Typescript
- Expo (with Expo Router)
- Tamagui (cross-platform UI system)
- Zustand (global state management)
- Zod (runtime schema validation)
- React Hook Form (forms & validation)
- Reanimated / Moti (animations & gestures)

**Backend & Services**

- Supabase
  - Authentication & email verification
  - PostgreSQL database
  - Storage for media & attachments
  - RPC functions (business logic)
  - Edge Functions (server-side processing & secrets)
- Stream Chat (real-time messaging & audio messages)
- Twilio SendGrid (transactional email)

---

## ⚠️ Setup & Development Notice

Olign is **not a plug-and-play application**.

The project follows a **backend-driven architecture**, where most business logic is implemented inside **Supabase** rather than the client application. This includes:

- Custom SQL schemas and relations
- Database RPC (Remote Procedure Call) functions
- Supabase Edge Functions
- Server-side secrets and environment variables

Because of this tight coupling, the application **cannot be run locally with a simple install command** without fully recreating the backend infrastructure.

### What this repository includes

- Mobile application source code
- UI implementation and navigation
- Client-side Supabase integration
- Stream Chat client logic

### What this repository does NOT include

- Supabase project configuration
- Database schemas and migrations
- RPC function definitions
- Edge Function implementations
- Production secrets and keys

Only the **Supabase public (anon) key** is referenced by the client. All other sensitive keys and logic are securely stored and executed within Supabase.

## 🧠 Architectural Note

Olign intentionally places validation, permissions, and core business logic on the backend using Supabase RPCs and Edge Functions. This approach:

- Reduces client-side complexity
- Improves security and data integrity
- Centralizes business rules
- Scales better for collaborative features

## 🎓 Academic Context

- **Methodology:** Rapid Application Development (RAD)
- **Focus:** Student collaboration, productivity, and communication
- **Evaluation:** User Acceptance Testing (UAT) and usability analysis

## 🔮 Future Enhancements

- AI-assisted task scheduling
- Push notifications
- Calendar integration
- Improved offline support

## 👨‍💻 Author

**Muhammad Mahran bin Mazlan**<br>
Bachelor of Information Technology (Hons) in Software Engineering<br>
Universiti Kuala Lumpur - Malaysian Institute of Information Technology (UniKL MIIT)

## 📄 License

This project is developed for academic purposes.<br>
© 2024 - Present Muhammad Mahran bin Mazlan. All rights reserved.
