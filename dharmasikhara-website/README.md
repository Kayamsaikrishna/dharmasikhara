# DharmaSikhara - Immersive Legal Practice Simulator

Welcome to DharmaSikhara, an innovative legal education platform that transforms how law students and junior lawyers develop essential courtroom skills through immersive simulation technology.

## About DharmaSikhara

DharmaSikhara is revolutionizing legal education by providing a cutting-edge virtual environment where learners can practice real-world legal scenarios without the pressure of actual consequences. Our platform bridges the gap between theoretical knowledge and practical application, preparing future legal professionals for success in their careers.

## Key Features

- **Realistic Role Play**: Experience authentic legal scenarios as attorneys, judges, witnesses, and jurors
- **AI-Powered Feedback**: Receive instant, personalized coaching on argumentation and courtroom presence
- **Extensive Case Library**: Access thousands of diverse legal scenarios across multiple practice areas
- **Progress Analytics**: Track skill development with detailed performance metrics
- **Multiplayer Simulations**: Collaborate or compete with peers in complex legal proceedings
- **Anytime, Anywhere Access**: Practice on any device, from courtroom procedure to client consultation

## Target Audience

- **Law Students**: Gain practical experience before entering the workforce
- **Junior Lawyers**: Accelerate professional development with risk-free practice
- **Law Firms**: Enhance training programs with standardized, scalable simulations

## Why DharmaSikhara?

Unlike traditional legal education methods, DharmaSikhara offers unlimited practice scenarios with intelligent adaptive learning that adjusts to your skill level. Our real-time performance analysis provides immediate feedback, helping users understand their strengths and areas for improvement instantly.

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js with Express
- **Email Service**: Nodemailer
- **Data Storage**: JSON file-based storage (can be upgraded to MongoDB/PostgreSQL)
- **Deployment**: Docker containerization

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker (optional, for containerized deployment)

### Running the Application Locally

1. Install dependencies:
   ```
   npm install
   ```

2. Configure email service (optional):
   - Copy `.env.example` to `.env`
   - Update `EMAIL_USER` and `EMAIL_PASS` with your email credentials
   - For Gmail, use an App Password instead of your regular password

3. Start the development server:
   ```
   npm start
   ```

4. Visit `http://localhost:3000` in your browser

### Running with Docker

1. Build and start the Docker container:
   ```
   docker-compose up --build
   ```

2. Visit `http://localhost:3000` in your browser

### Development Mode

For development with auto-restart on file changes:
```
npm run dev
```

## Email Subscription System

The website includes a fully functional email subscription system that:

- Validates email addresses
- Prevents duplicate subscriptions
- Stores emails in a JSON file (`subscribers.json`)
- Sends confirmation emails to subscribers
- Provides user feedback for successful/failed submissions

### Email Configuration

To enable actual email sending:

1. Create a `.env` file in the project root
2. Add your email credentials:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```
3. For Gmail:
   - Enable 2-factor authentication
   - Generate an App Password
   - Use the App Password instead of your regular password

### Testing Email Service

In development mode, emails are logged to the console instead of being sent. When you deploy to production or set the `NODE_ENV` to "production" with valid credentials, actual emails will be sent.

To view all subscribers, visit `http://localhost:3000/subscribers` (in a real application, this would be protected).

## Project Structure

```
dharma-sikhara-website/
├── src/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── assets/
│       ├── law_icon.png
│       └── law_logo.png
├── server.js
├── package.json
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Custom Features

- **Font Awesome Icons**: Professional icons for all sections
- **Responsive Design**: Works on mobile, tablet, and desktop devices
- **Interactive Elements**: Hover effects, animations, and smooth scrolling
- **Form Validation**: Client and server-side email validation
- **Containerized Deployment**: Easy deployment with Docker
- **Complete Email Service**: Subscription management with confirmation emails

## Future Enhancements

- Integration with MongoDB/PostgreSQL for better data management
- Admin dashboard for managing subscribers
- Enhanced analytics and reporting
- User authentication and profiles
- Integration with email marketing services (Mailchimp, SendGrid, etc.)

---

*DharmaSikhara - Shaping the Future of Legal Education*