# 🎯 QuestAI - AI-Powered Interview Management Platform

**A comprehensive interview management system featuring AI avatars, real-time analytics, and intelligent question generation.**

## ✨ Key Features

### 🤖 AI-Powered Interview Experience

- **HeyGen AI Avatars**: Professional AI avatars deliver questions with natural speech
- **Multiple Presentation Modes**: Speech synthesis, AI video generation, or custom uploads
- **Smart Fallbacks**: Graceful degradation ensures interviews always work
- **Dropbox Integration**: Secure cloud storage for all video content

### 📊 Advanced Analytics Dashboard

- **Real-time Metrics**: Live application tracking and completion rates
- **Interactive Tables**: Sortable, searchable candidate management
- **Pass/Fail Evaluation**: One-click candidate assessment tools
- **Progress Tracking**: Timestamp-based completion calculations

### 🧠 Intelligent Question Generation

- **Google Gemini AI**: Auto-generates relevant interview questions
- **Expert Fallbacks**: Professional templates when AI is unavailable
- **Customizable Difficulty**: Tailored questions for different skill levels
- **Multi-category Support**: Technical, behavioral, and problem-solving questions

### 🔐 Secure & Scalable

- **NextAuth.js Authentication**: Role-based access control
- **Public Interview Links**: Secure candidate access without registration
- **Prisma ORM**: Type-safe database operations with PostgreSQL
- **Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** database
- **API Keys**: HeyGen, Google Gemini, Dropbox, Resend (optional)

### Installation

1. **Clone and Install**

   ```bash
   git clone <repository-url>
   cd replay-mvp
   npm install
   ```

2. **Environment Setup**

   Copy `.env.example` to `.env` and configure:

   ```bash
   # Database Configuration
   DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"

   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secure-random-secret-here"

   # Email Service (Optional - for notifications)
   RESEND_API_KEY="your-resend-api-key"
   FROM_EMAIL="no-reply@questai.com"

   # Default Admin Account
   SEED_ADMIN_EMAIL="admin@questai.com"
   SEED_ADMIN_PASSWORD="ChangeMe123!"

   # AI Services
   GEMINI_API_KEY="your-gemini-api-key-from-google-ai-studio"
   HEYGEN_API_KEY="your-heygen-api-key"

   # File Storage
   DROPBOX_ACCESS_TOKEN="your-dropbox-access-token"
   ```

3. **Database Setup**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Apply database migrations
   npx prisma migrate dev --name init

   # (Optional) Seed with sample data
   npx prisma db seed
   ```

4. **Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys Setup

### Required Services

#### 1. **Google Gemini AI** (Required for AI questions)

- Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
- Create API key and add to `GEMINI_API_KEY`

#### 2. **HeyGen** (Required for AI avatars)

- Sign up at [HeyGen](https://heygen.com)
- Get API key from dashboard
- Add to `HEYGEN_API_KEY`

#### 3. **PostgreSQL Database** (Required)

- Use local PostgreSQL or cloud providers:
  - [Supabase](https://supabase.com) (Free tier available)
  - [Neon](https://neon.tech) (Free tier available)
  - [Railway](https://railway.app) (Free tier available)

#### 4. **Dropbox** (Optional - for video storage)

- Create Dropbox App at [Dropbox Developers](https://www.dropbox.com/developers)
- Generate access token and add to `DROPBOX_ACCESS_TOKEN`

#### 5. **Resend** (Optional - for email notifications)

- Sign up at [Resend](https://resend.com)
- Add API key to `RESEND_API_KEY`

## 📁 Project Structure

```
replay-mvp/
├── app/
│   ├── api/                    # API routes
│   │   ├── applications/       # Application management
│   │   ├── avatar/             # HeyGen avatar integration
│   │   ├── positions/          # Interview position APIs
│   │   └── auth/               # NextAuth configuration
│   ├── dashboard/              # Manager dashboard
│   │   └── positions/          # Position management UI
│   ├── interview/              # Public interview interface
│   └── globals.css             # Global styles
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── interview/              # Interview UI components
│   └── ui/                     # Reusable UI components
├── lib/
│   ├── heygen.ts              # HeyGen AI service
│   ├── ai-interviewer.ts      # Gemini AI integration
│   ├── prisma.ts              # Database client
│   └── video-manager.ts       # Video management service
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
└── types/                     # TypeScript type definitions
```

## 🎮 Usage Guide

### For Managers

1. **Create Account**: Sign up or use seeded admin account
2. **Create Position**: Navigate to Dashboard → New Position
3. **Add Questions**:
   - Use AI generation with Gemini
   - Add custom questions manually
   - Mix both approaches
4. **Configure Presentation**:
   - Choose speech synthesis (default)
   - Enable AI avatar videos
   - Upload custom video presentations
5. **Share Interview**: Copy public link and share with candidates
6. **Monitor Progress**: View real-time analytics and candidate responses
7. **Evaluate Candidates**: Use pass/fail controls in dashboard

### For Candidates

1. **Access Interview**: Click on shared public link
2. **Complete Questions**: Answer each question in the text area
3. **Track Progress**: See completion percentage in real-time
4. **Submit**: Responses auto-save, submit when complete

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npx prisma studio          # Database GUI
npx prisma migrate reset    # Reset database
npx prisma db push          # Push schema changes

# Code quality
npm run lint               # ESLint
npm run type-check         # TypeScript check
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker (Alternative)

```bash
# Build image
docker build -t questai .

# Run container
docker run -p 3000:3000 --env-file .env questai
```

## 🛠 Production Considerations

### Performance

- Enable database connection pooling
- Configure Redis caching for sessions
- Use CDN for static assets
- Implement video compression

### Security

- Use strong `NEXTAUTH_SECRET`
- Enable HTTPS in production
- Configure CORS policies
- Implement rate limiting

### Monitoring

- Set up error tracking (Sentry)
- Monitor API performance
- Track video generation costs
- Database performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎯 QuestAI** - Transforming interviews with AI-powered intelligence.
