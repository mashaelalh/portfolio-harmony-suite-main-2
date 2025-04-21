# Project Management Information System (PMIS) - EPMO Tool

## Overview

This project is the frontend application for the internal Enterprise Project Management Office (EPMO) Tool. It provides comprehensive functionalities for managing projects, portfolios, risks, and generating executive reports with advanced strategic alignment capabilities.

Key Features:
*   Strategic Objective Tracking
*   Corporate KPI Management
*   Advanced Project Filtering and Reporting
*   Real-time Strategic Insights Dashboard

The application is built using a modern web stack, leveraging Supabase as its Backend-as-a-Service (BaaS), with a focus on strategic project management and organizational alignment.

## Key Technologies

*   **Frontend Framework:** React
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **UI Library:** Shadcn UI
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Backend:** Supabase (Authentication, Database, potentially Edge Functions)
*   **Routing:** React Router DOM
*   **Forms:** React Hook Form with Zod validation

## Local Development Setup

To set up and run this project locally, follow these steps:

1.  **Prerequisites:**
    *   Node.js (LTS version recommended)
    *   npm (comes with Node.js)
    *   Git

2.  **Clone the Repository:**
    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd <YOUR_PROJECT_DIRECTORY>
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Environment Variables:**
    *   This project requires Supabase credentials to connect to the backend.
    *   Create a `.env` file in the root of the project.
    *   Add your Supabase URL and Anon Key to the `.env` file:
        ```dotenv
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   Obtain these values from your Supabase project settings.

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically available at `http://localhost:5173`. The server supports Hot Module Replacement (HMR) for a fast development experience.

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Builds the application for production.
*   `npm run build:dev`: Builds the application using the development mode configuration.
*   `npm run lint`: Runs ESLint to check for code style issues.
*   `npm run audit`: Checks for known security vulnerabilities in dependencies.
*   `npm run preview`: Serves the production build locally for previewing.

## Architecture Overview

### Strategic Alignment Architecture

The PMIS tool implements a comprehensive strategic alignment architecture with the following key components:

*   **Strategic Objective Management**
    -   Predefined strategic objectives with dropdown selection
    -   Tracking across project lifecycle
    -   Visualization in executive dashboards

*   **Corporate KPI Integration**
    -   Multi-tag KPI tracking
    -   Limit of 5 KPIs per project
    -   Real-time reporting and filtering

*   **Data Flow**
    1. Project Creation: Strategic details captured
    2. Project Tracking: Continuous alignment monitoring
    3. Executive Reporting: Comprehensive strategic insights

### Technical Architecture

*   **Frontend:** React with TypeScript
*   **State Management:** Zustand with type-safe stores
*   **Validation:** Zod schema-based validation
*   **Backend:** Supabase with Row Level Security (RLS)

## Contribution Guidelines

### Strategic Alignment Contribution Principles

*   **Objective Clarity:** Ensure new features align with predefined strategic objectives
*   **KPI Relevance:** Maintain meaningful and measurable corporate KPIs
*   **Data Integrity:** Implement robust validation for strategic data

### Code Contribution Requirements

*   Follow TypeScript best practices
*   Implement comprehensive Zod schema validations
*   Write unit tests for new strategic alignment features
*   Maintain consistent UI/UX across strategic tracking interfaces

### Branching Strategy

*   `main`: Stable production release
*   `develop`: Integration branch for new features
*   `feature/strategic-*`: Specific strategic alignment feature branches
*   `bugfix/strategic-*`: Strategic feature bug fixes

### Code Review Process

*   Mandatory review of strategic alignment implementation
*   Validate data model consistency
*   Ensure performance and scalability of strategic tracking features
