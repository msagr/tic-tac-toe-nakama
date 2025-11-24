# Tic-Tac-Toe Multiplayer with Nakama

A real-time multiplayer Tic-Tac-Toe game built with Next.js and Nakama game server.

## Table of Contents
- [Setup and Installation](#setup-and-installation)
- [Architecture and Design](#architecture-and-design)
- [Deployment Process](#deployment-process)
- [Testing Multiplayer](#testing-multiplayer)

## Setup and Installation

### Prerequisites
- Node.js v18+ (LTS recommended)
- npm v9+
- Docker + Docker Compose
- Git

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/msagr/tic-tac-toe-nakama](https://github.com/msagr/tic-tac-toe-nakama)
   cd tic-tac-toe-nakama

2. **setup the backend**
    ```bash
    cd backend
    docker compose build
    docker compose up
    ```

3. **setup the frontend**
    ```bash
    cd frontend
    npm install
    cp .env.local.example .env.local
    npm run dev
    ```

## Architecture and Design

### Frontend (Next.js)
- **Framework**: Next.js with App Router
- **Key Features**:
  - Responsive UI with React
  - Real-time gameplay using WebSockets
  - Session management with Nakama
  - Room-based matchmaking

### Backend (Nakama)
- **Core Components**:
  - Authoritative game server
  - Matchmaking system
  - Real-time multiplayer support
  - Persistent storage (PostgreSQL)

### Data Flow
1. Players connect via WebSocket
2. Game state is synchronized in real-time
3. All game logic is server-authoritative
4. Matchmaking handles player pairing

## Deployment Process

1. Backed is deployed in render using render managed postgreSQL DB.
2. Frontend is deployed in Vercel.

## Testing multiplayer

1. I tested this manually -
    a. Open the application in two separate windows.
    b. Login with different ids.
    c. In multiplayer -> join; click from both windows
    d. Now both users can join and play with each other.

## Links

- frontend -> [tic-tac-toe-nakama-z4di.vercel.app](tic-tac-toe-nakama-z4di.vercel.app)
- backend endpoint -> [https://tic-tac-toe-nakama.onrender.com](https://tic-tac-toe-nakama.onrender.com)