# 🔬 RRWA (Research Repo Web App)

**An AI-First Project Management & Collaboration Platform for Academia**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen?style=for-the-badge&logo=vercel)](https://rrwa-rho.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/status-alpha-important?style=for-the-badge)

RRWA is a full-stack platform designed to revolutionize how universities handle projects, research, and collaborations. Think of it as a powerful hybrid of LinkedIn, ResearchGate, Trello, and Reddit, tailored specifically for students, professors, and industry partners.

> **Note:** 🚧 This project is in an **Alpha** state. It is a functioning proof-of-concept with a complete feature set, but the codebase requires refactoring and polishing to be considered production-ready. We welcome contributors to help us get there!

## ✨ Live Demo

Experience the platform firsthand: **[Live Demo](https://rrwa-rho.vercel.app/)**

*Please note that the demo is connected to a shared database; expect to see existing data.*

---

## 🚀 Features

| Module | Description |
| :--- | :--- |
| **👤 Academic Profiles** | LinkedIn-style profiles to showcase projects, skills, and publications. |
| **📋 Intelligent Project Mgmt** | Kanban boards, task tracking, and a prototype **AI Task Breakdown Engine**. |
| **📚 Research Repository** | A centralized hub for papers, patents, theses, and capstone projects. |
| **💬 Integrated Communication** | Contextual chats, threaded comments, and Reddit-style AMA sessions. |
| **🤖 AI-Powered Suggestions** | *(Prototype)* Suggestions for team formation and research topics. |
| **🌐 Opportunity Corner** | A marketplace for internships, RA/TA positions, and collaborations. |


## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Context API/Hooks, CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB, Mongoose
*   **Authentication:** JWT
*   **Deployment:** Vercel (Frontend), TBD (Backend)
*   **AI/ML:** Python (Prototype phase, not in main repo)

## 🤝 Why Contribute?

This project has a powerful vision to bridge the gap between academia and industry. By contributing, you can:
*   🛠️ Gain experience with a full-stack, feature-rich application.
*   🤖 Work on integrating cutting-edge AI features into a real platform.
*   🌍 Help build a tool that empowers students and researchers globally.
*   👨‍💻 Collaborate on a project that has already received strong validation from academia and industry.

## 🚧 Current State & Contribution Areas

This project is **open source but not yet refactored** for mass contribution. This is a great opportunity for developers who enjoy tackling challenging, real-world codebases.

**High-Priority Areas for Improvement:**
*   **Code Refactoring:** Breaking down large components, improving naming conventions, and simplifying complex logic.
*   **State Management:** Migrating from Context API to a more structured solution like Redux Toolkit or Zustand.
*   **Styling & UI/UX:** Implementing a consistent design system (e.g., with Chakra UI, Material-UI, or Tailwind CSS).
*   **Backend Optimization:** Refactoring controllers, improving error handling, and enhancing API security.
*   **Documentation:** Adding JSDoc comments, contributor guidelines, and feature explanations.
*   **Testing:** Writing unit and integration tests (currently lacking).

## 📦 Getting Started (For Developers)

### Prerequisites

-   **Node.js** (v16 or higher)
-   **npm** or **yarn**
-   **MongoDB** (A local instance or a MongoDB Atlas URI)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/sandip-pathe/rr.git
    cd rr
    ```

2.  **Setup Environment Variables**
    *   Create a `.env` file in the `server/` directory.
    *   Add your configuration:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string_here
    JWT_SECRET=your_super_secret_jwt_key_here
    # Any other API keys
    ```

3.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

4.  **Run the Application**
    *   **Start the backend server:**
        ```bash
        cd server
        npm run dev
        ```
    *   **In a new terminal, start the frontend client:**
        ```bash
        cd client
        npm start
        ```
5.  Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📖 Documentation

*   [API Documentation](./docs/api.md) *(To be written)*
*   [Database Schema](./docs/schema.md) *(To be written)*
*   [Contributing Guidelines](./CONTRIBUTING.md) *(To be written)*

## 👥 Contributing

We enthusiastically welcome contributions! Since this project is in its early open-source stages, your patience and initiative are highly valued.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request and clearly describe the changes you've made.

Please read our (forthcoming) `CONTRIBUTING.md` guide for detailed instructions.

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 📞 Contact

Sandip Pathe - [LinkedIn: @sandippathe](https://www.linkedin.com/in/sandippathe/) - sandippathe9689@gmail.com

Project Link: [https://github.com/sandip-pathe/rr](https://github.com/sandip-pathe/rr)

---

## 🙏 Acknowledgments

*   Built as a final-year project with the team of 4 developers.
*   Thanks to all professors and industry experts who provided valuable feedback and validation.
