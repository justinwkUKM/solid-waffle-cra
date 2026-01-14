# PayNet CRA App

**Automated Cloud Risk Assessment Parser & Analyzer**

The PayNet CRA App is a modern web application designed to streamline the Cloud Risk Assessment (CRA) process. It allows users to upload CRA Excel workbooks, parse them into a structured format, manage assessments through a workflow, and leverage AI to analyze responses for compliance and risk.

## Key Features

- **Excel Parsing**: Instantly parse complex CRA Excel workbooks to extract solution details and assessment questions.
- **Manual Assessment**: Create assessments from scratch with a built-in digital form.
- **AI Analysis**: Powered by Google Gemini AI to analyze assessment responses, identify risks, and suggest mitigations.
- **Workflow Management**:
    - **Submitters**: Create, edit, and submit assessments.
    - **Assessors**: Review submissions, provide feedback, request changes, or approve/reject assessments.
- **Dashboard**: Visual overview of assessment status, risk distribution, and completion progress.
- **Excel Export**: Generate standard Excel reports from digital assessments.
- **Role-Based Access Control**: Secure authentication and authorization for Submitters, Assessors, and Admins.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [SQLite](https://www.sqlite.org/) (via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **AI**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (Gemini)
- **Excel Processing**: [ExcelJS](https://github.com/exceljs/exceljs)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cra-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory with the following variables:

    ```env
    # Database
    DATABASE_URL="file:./dev.db"

    # Authentication (NextAuth.js)
    AUTH_SECRET="your-super-secret-key" # Generate with: npx auth secret

    # AI (Google Gemini)
    GEMINI_API_KEY="your-gemini-api-key"
    ```

4.  **Database Setup:**
    Initialize the SQLite database and push the schema:
    ```bash
    npx prisma db push
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

### For Submitters
1.  **Sign Up/Login**: Create an account or log in.
2.  **New Assessment**:
    - **Upload**: Drag and drop an existing CRA Excel file.
    - **Manual**: Start a fresh assessment using the digital form.
3.  **Edit**: Fill in "Cloud Solution Details" and answer assessment questions.
4.  **AI Assist**: Use "Analyze with AI" to get insights on your answers.
5.  **Save/Submit**: Save as draft or submit for review when ready.

### For Assessors
1.  **Dashboard**: View all submitted assessments.
2.  **Review**: Open an assessment to review answers and AI analysis.
3.  **Action**:
    - **Approve**: Mark the assessment as compliant.
    - **Reject**: Deny the assessment with feedback.
    - **Request Changes**: Send it back to the submitter for updates.

### For Admins
- Access the **Admin Console** to manage users and roles.
- Promote users to Assessor or Admin roles.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, types, and constants.
- `prisma`: Database schema and migrations.
- `public`: Static assets.

## License

[Custom License](LICENSE)
