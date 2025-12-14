# Olign – UI & Interaction Overview

This document provides a **visual walkthrough of Olign’s user interface and interactions**. It is intended to give visitors an overview of the application **without requiring local setup or execution**.

## 🔐 Authentication Flow

### Sign In & Sign Up

![Sign In Screen](./github/img/sign-in-screen.jpg)

Users can either sign in or register from a single authentication screen. Form validation ensures correct input before submission.

### Email Verification

![Verification Screen](./github/img/verification-screen.jpg)

After registration, users must verify their email before proceeding. Verification is handled securely via Supabase and email delivery services.

### Profile Setup

![Setup Profile Screen](./github/img/setup-profile-screen.jpg)

Users configure their username, display name, and avatar before accessing the main application.

## 🏠 Core Navigation

### Home & Channels

![Channels Tab](./github/img/channels-tab.jpg)

The Channels tab is the default landing view, displaying all active direct and group conversations.

## 💬 Messaging Experience

### Messaging Screen

![Messaging Screen](./github/img/messaging-screen.jpg)

Messages are displayed in real time with support for text, media, tasks, and audio messages.

### Audio Messages

![Recorded Message](./github/img/recorded-message.jpg)

Users can record and send voice messages directly from the chat interface.

### Attachments & Media

![Media Picker](./github/img/media-picker.jpg)

Attachments such as images and files can be added seamlessly without leaving the conversation.

## ✅ Task Collaboration

### Task Creation in Chat

![Task Maker Screen](./github/img/task-maker-screen.jpg)

Tasks can be created directly inside conversations, with optional deadlines, assignees, and milestones.

---

### Tasks in Conversation

![Task in Conversation](./github/img/task-in-conversation.jpg)

Tasks are posted into chats for visibility and collaborative tracking.

## 👥 Friends & Groups

### Friends Management

![Friends Tab](./github/img/friends-tab.jpg)

Users can add friends, manage requests, and build their collaboration network.

## 👤 Profile

### User Profile

![Profile Tab](./github/img/profile-tab.jpg)

Users can update profile information and manage account preferences from the Profile tab.

## 🎯 Purpose of This Overview

This UI overview exists to:

- Demonstrate application scope and complexity
- Showcase interaction design and UX decisions
- Allow reviewers to understand Olign without running it locally

For architectural and technical details, refer back to the main [README](./README.md).
