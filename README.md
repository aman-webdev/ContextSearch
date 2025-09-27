# ContextSearch - AI-Powered Content Search & Chat


An intelligent document search and chat application that allows you to upload various types of content and get AI-powered answers from your documents using RAG (Retrieval-Augmented Generation).

<img width="1915" height="968" alt="ContextSearch Application Screenshot" src="https://github.com/user-attachments/assets/d986dbc1-bcca-4988-a313-b5e2e9f0886c" />

## ✨ Features

- **Multi-Format Support**: Upload and search across PDFs, subtitles (SRT/VTT), websites, and YouTube videos
- **AI-Powered Chat**: Ask questions about your content and get intelligent responses
- **Vector Search**: Advanced semantic search using embeddings and vector storage
- **Real-time Processing**: Instant content processing and indexing
- **User Sessions**: Guest and registered user support with upload limits
- **Duplicate Detection**: Prevents duplicate content uploads
- **Responsive Design**: Modern, clean interface that works on all devices

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Vector Store**: Qdrant for semantic search
- **AI/ML**: OpenAI for embeddings and chat completions
- **Authentication**: JWT with custom middleware
- **File Processing**: LangChain for document processing

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Qdrant vector database
- OpenAI API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-extension
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Environment Setup

Copy the demo environment file and configure your settings:

```bash
cp .env.demo .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/contextSearch"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Qdrant Vector Database
QDRANT_URL="http://localhost:6333"

# JWT Secret
JWT_SECRET_KEY="your-jwt-secret-key"

# Optional: For production
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup

Run the Prisma migrations to set up your database:

```bash
npx prisma migrate dev
# or
npx prisma db push
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 5. Start Qdrant (Vector Database)

Using Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Or install Qdrant locally following their [installation guide](https://qdrant.tech/documentation/quick-start/).

### 6. Start the Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:3000`.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # Chat functionality
│   │   ├── upload/       # File upload handling
│   │   ├── subtitles/    # Subtitle file processing
│   │   ├── website/      # Website content processing
│   │   ├── youtube/      # YouTube video processing
│   │   └── me/           # User session management
│   └── page.tsx          # Main application page
├── components/            # React components
│   ├── chat/             # Chat interface components
│   ├── upload/           # File upload components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── services/         # Business logic services
│   └── prisma.ts         # Database client
├── prisma/               # Database schema and migrations
└── middleware.ts         # Authentication middleware
```

## 🔧 API Endpoints

- `POST /api/upload` - Upload PDF documents
- `POST /api/subtitles` - Upload subtitle files (SRT/VTT)
- `POST /api/website` - Process website URLs
- `POST /api/youtube` - Process YouTube videos
- `POST /api/chat` - Send chat messages and get AI responses
- `GET /api/documents` - Fetch user's uploaded documents
- `GET /api/me` - Create/manage user sessions

## 💡 Usage

1. **Upload Content**: Use the sidebar to upload PDFs, subtitles, add websites, or YouTube videos
2. **Select Source**: Choose which content to search from the uploaded files
3. **Ask Questions**: Type your questions in the chat interface
4. **Get Answers**: Receive AI-powered responses based on your content

## 🔒 Authentication

The app uses JWT-based authentication with:
- **Guest Users**: 15 upload limit, temporary sessions
- **Registered Users**: 50 upload limit, persistent accounts
- **Session Management**: Automatic token refresh and validation

## 🗄 Database Schema

Key models:
- **User**: User accounts and sessions
- **UploadedDocuments**: Metadata for all uploaded content
- **Video**: YouTube video information
- **DocumentType**: Enum for FILE, WEBSITE, YOUTUBE_TRANSCRIPT, SUBTITLE

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Database Connection Error**
- Ensure PostgreSQL is running
- Check your `DATABASE_URL` in `.env`
- Run `npx prisma db push` to sync schema

**Qdrant Connection Error**
- Ensure Qdrant is running on port 6333
- Check `QDRANT_URL` in `.env`

**OpenAI API Error**
- Verify your `OPENAI_API_KEY` is valid
- Check your OpenAI account has sufficient credits

**File Upload Issues**
- Check file size limits
- Ensure supported file formats (PDF, SRT, VTT)
- Verify disk space for temporary files

## 📧 Support

For questions or issues, please:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information

---
