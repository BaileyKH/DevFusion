# DevFusion

DevFusion is a collaborative project management platform built for developers to efficiently manage tasks, share files, and work on projects together. With features like real-time chat, GitHub integration, and user invitations, DevFusion aims to streamline the workflow and enhance collaboration for any project.

## Features

### 1. Project Management
- **Create Projects**: Users can create new projects, each with a unique name and description.
- **Task Management**: Keep track of all tasks within the project to ensure timely delivery.
- **Change Logs**: View project change logs to track the history of the project updates and contributions.

### 2. Real-Time Chat
- **Real-time Messaging**: Each project has a chat feature, allowing members to collaborate through real-time messaging.
- **Mention Team Members**: Mention team members in the chat to notify them directly.
- **Hyperlink Support**: Links shared in chat are automatically formatted into clickable hyperlinks.
- **File Sharing**: Members can share files within the chat, making collaboration and communication more effective.

### 3. GitHub Integration
- **Link GitHub Repositories**: Link GitHub repositories to projects for easy access to the codebase.

### 4. User Invitations and Membership
- **Invite Members**: Project owners can invite other users to contribute to their projects. Invited users can accept or decline invitations.
- **Invitation Dashboard**: Users are notified of pending invitations, which can be accepted or declined from the dashboard.
- **Permissions**: Only project owners can add members or remove contributors from the project.

### 5. Dashboard
- **Project Overview**: View an overview of all projects a user is a member of from the main dashboard.
- **Pending Invitations Sidebar**: An invitation sidebar is always accessible from the bottom right of the dashboard, displaying pending project invitations.

## Technologies Used

- **Frontend**: React with TypeScript, TailwindCSS for styling, Framer Motion for animations.
- **Backend**: Supabase for database management, authentication, and real-time capabilities.
- **Routing**: React Router for navigation between pages.
- **Third-party Integrations**: GitHub API for repository integration.
- **UI Components**: Custom components like cards, input fields, and buttons are built using reusable UI elements from shadcn/magicui.


## Project Structure

- **/components**: Reusable components like buttons, cards, and modal components.
- **/pages**: Main pages such as Dashboard, Project Dashboard, Add Contributors, etc.
- **/supabaseDB.ts**: Supabase client configuration.
- **/hooks**: Custom hooks like `useToast` for displaying notifications.

## Contact

For any inquiries, feel free to contact me via [hen.baileyk@gmail.com].

---

Thank you for using **DevFusion**!

