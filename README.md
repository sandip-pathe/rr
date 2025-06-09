## Project Description: "Research Repo Web App"

This is a comprehensive web application built with Next.js, React, and TypeScript, designed as a collaborative platform for students, professors, and researchers. It functions as a specialized social network and project management tool tailored for an academic or research-oriented environment. The backend is powered by Firebase (Firestore, Authentication, and Storage), and the UI is built with Tailwind CSS and the shadcn/ui component library.



Core Functionality:

The application is structured around a central dashboard that users access after logging in. Key features include:

1. Authentication and User Profiles:



Authentication: A complete user authentication system using Firebase Auth with email and password. It includes separate pages for registration and login.

Multi-Step Registration: After initial sign-up, users are guided through a second registration step to provide more detailed profile information like their academic degree, role (student, professor, professional), and a personal introduction.

User Profiles (/dashboard/me & /dashboard/people): Each user has a detailed profile page with tabs for an overview, research work, projects, and startups. Users can edit their own profiles and view the public profiles of others. The profile also includes social links and statistics relevant to their role (e.g., publications for professors, projects for students).

2. Project & Task Management:



Projects (/dashboard/projects): Users can create new projects or view their ongoing and completed projects. Projects have titles, descriptions, categories, due dates, and assigned members/admins.

AI-Powered Task Generation (/app/api/generateTasks): When creating a new project, users can leverage an AI feature that calls the GPT-4o model. It automatically breaks down the project title and description into a list of actionable tasks.

Kanban Board (/dashboard/board): A fully functional Kanban board for managing project tasks. It uses dnd-kit for drag-and-drop functionality, allowing users to move tasks between different stages (e.g., "To Do," "In Progress," "Done"). Access is role-based: admins can see all tasks, while members only see tasks assigned to them.

Task Management: Users can create, edit, and delete tasks within a project. Tasks can have titles, descriptions, due dates, and be assigned to specific team members.

3. Discovery & Collaboration Hub (/dashboard/repo):

This section is the central hub for discovering new information and opportunities.



Research Repository: A searchable feed of research papers and completed projects.

Problem Statements: A space where users can post complex problems, inviting the community to propose solutions. It includes features for showing interest and filtering by category.

Internship Board: A dedicated page for finding and posting internship opportunities. It includes detailed forms and filtering options for type, compensation, and status.

Open & Global Projects: A section for discovering public projects open for collaboration. It also contains a mocked-up "Global Innovations" feature designed to search for external projects and research (currently uses dummy data).

4. Communication & Community Engagement:



AMA (Ask Me Anything) (/dashboard/ama): A Q&A forum where users can post questions (anonymously or publicly) with image attachments. Other users can post nested replies. A key feature here is an AI-powered conversation summarizer that uses GPT-3.5-Turbo to provide concise summaries of long discussion threads.

Real-time Chat (/dashboard/more): A private messaging feature between users. It uses Firestore's onSnapshot for real-time updates and includes a user presence system to show if a user is online or their last-seen status.

Notifications (/dashboard/activity): A real-time activity feed that notifies users about important events, such as being added to a project, assigned a new task, or receiving a new message.

5. Technical Architecture & Components:



Frontend: Built with Next.js App Router. It uses a combination of Server Components for initial data fetching and Client Components for interactive UI.

Styling: Tailwind CSS is used for styling, with a rich set of custom UI components built using shadcn/ui.

State Management: Global authentication state is managed via React's Context API (AuthContext.tsx). Local component state is managed with useState and useEffect.

Forms: Form handling is done with react-hook-form and zod for validation, abstracted into a reusable CustomFormField component.

Areas for Improvement / Incomplete Features:

Security Alert: The FirebaseConfig.ts file contains hardcoded API keys and should be moved to environment variables (.env.local) immediately.

Global Innovation Search: This feature is currently a conceptual mock-up and requires a backend service to fetch real data from external sources like GitHub or academic APIs.

File Uploads: The "Add Research" form has a placeholder for file uploads which needs to be implemented using Firebase Storage.

Data Fetching: The application would benefit from more server-side data fetching to improve initial page load performance and reduce client-side loading states.