# Airbnb Clone

> A full-stack Airbnb-like web application built with Node.js, Express, MongoDB, and EJS.

## Features

- User authentication (signup/login/logout)
- Guest and host user roles
- Browse and search homes
- Book a home as a guest
- View and manage your bookings (cancel bookings)
- Add/remove homes to favourites
- Host can add homes (extendable)
- House rules download
- Responsive UI with EJS templates and Tailwind CSS

## Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- EJS (Embedded JavaScript templates)
- Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/airbnb-clone.git
   cd airbnb-clone
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your MongoDB connection in your environment (e.g., via `.env` or directly in your code).
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Visit `http://localhost:3000` in your browser.

## Project Structure

```
controllers/      # Route handlers
models/           # Mongoose schemas
public/           # Static assets (CSS, images)
routes/           # Express route definitions
utils/            # Utility modules
views/            # EJS templates
uploads/          # Uploaded images
rules/            # House rules PDFs
app.js            # Main app entry point
package.json      # Project metadata
```

## Usage

- Sign up as a guest or host
- Browse homes and view details
- Book a home (guests only)
- View/cancel your bookings
- Add/remove homes to your favourites

## License

This project is for educational/demo purposes only.
