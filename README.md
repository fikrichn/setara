# Setara — Algebraic Equation Balancing Game

**Setara** is an interactive web-based educational game designed to help players understand linear equations and the concept of transposing terms ("pindah ruas") in algebra through visual and engaging gameplay.

## Key Features

- **Interactive Term Transposition:** Move variables and constants across both sides of an equation with automatic sign-inversion mechanics.
- **Progressive Levels & Boss Encounters:** Advance through structured stages—from basic linear equations to challenging Boss battles with increasing complexity.
- **Badge & Achievement System:** Unlock collectible badges based on accuracy, speed, and stage completion.
- **Instant Visual Feedback:** Real-time animations and balance indicators help players grasp the mathematical logic behind every move.

## Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite

## Getting Started

Make sure you have **Node.js** installed on your machine, then follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com
   cd setara
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to the local URL shown in your terminal (usually `http://localhost:5173`).

## Project Structure

```text
setara/
├── public/          # Static assets (images, icons, audio)
├── src/
│   ├── components/  # UI components and game screens
│   ├── data/        # Level configurations, equations, and badge definitions
│   ├── types/       # TypeScript type definitions
│   └── App.tsx      # Main application component
├── index.html
└── package.json
```

## License

Copyright © 2026 [fikrichn](https://github.com). All rights reserved.
