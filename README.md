# AI-Powered Receipt Processing System

A full-stack, cross-platform application that demonstrates how to integrate AI into a real-world workflow using a shared backend.

## Overview

This project is a **full-stack AI-powered receipt processing system** built with:

- .NET backend (Clean Architecture)
- React web client (Vite + Tailwind)
- Expo / React Native mobile app (NativeWind)

The goal is to showcase how a **single backend can power multiple clients** while integrating AI to extract structured data from receipt images.

---

## Key Features

- Upload receipt images from web or mobile
- AI-powered data extraction
- Structured output (merchant, date, total, category)
- Shared backend powering both clients
- Clean architecture for scalability and maintainability

---

## Architecture

The backend is designed using **Clean Architecture**, separating concerns into layers:

- Domain → Core business logic  
- Application → Use cases and workflows  
- Infrastructure → External services (AI, storage, APIs)  

This ensures:

- Business logic is independent of frameworks  
- AI providers can be swapped easily  
- Codebase remains maintainable and testable  

---

## How It Works

1. A user uploads a receipt image from either:
   - the React web app  
   - the Expo mobile app  

2. The .NET backend receives the image  

3. The backend sends the image to an AI service  

4. The AI extracts structured data:
   - merchant  
   - total  
   - date  
   - category  

5. The structured data is returned and displayed in both clients  

---

## Frontend Clients

### React Web Client

- Built with Vite  
- Styled using Tailwind CSS  
- Uses Axios for API communication  
- Handles receipt upload and displays extracted data  

---

### Expo Mobile App

- Built with Expo (React Native)  
- Uses:
  - expo-image-picker → select/take receipt photos  
  - expo-image → display images efficiently  
  - nativewind → Tailwind-style styling for mobile  

---

## Tech Stack

### Backend
- .NET  
- Clean Architecture  
- REST API  

### Web
- React  
- Vite  
- Tailwind CSS  
- Axios  
- React Router  

### Mobile
- Expo  
- React Native  
- NativeWind  
- Expo Image Picker  

### AI Integration
- External AI service for receipt data extraction  

---

## Why This Project Matters

This project demonstrates:

- Full-stack application design  
- Cross-platform architecture  
- Reusable backend APIs  
- Practical AI integration  
- Clean and maintainable backend structure  

It’s not just a receipt app — it’s an example of how to design a **scalable system that supports multiple clients with shared logic**.

---

## Key Takeaway

A single, well-structured backend can power both web and mobile applications while integrating AI in a simple and practical way.

---

## Demo

(Add your video link here)

---

## Feedback

I’d love to hear your thoughts or suggestions!
