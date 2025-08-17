# JA Automóveis - Full Stack Application

A high-performance full-stack application for JA Automóveis, built with React, TypeScript, Node.js, and MongoDB. Optimized for SEO, performance, and user experience.

## 🚀 Recent Performance Improvements

### Performance
- ✅ **Video Hero Optimization**: Added poster image and viewport-based pausing
- ✅ **Responsive Images**: Implemented srcSet with multiple sizes (600/900/1200px)
- ✅ **Lazy Loading**: Dynamic imports for framer-motion and optimized image loading
- ✅ **Backend Pagination**: Added pagination and filtering to `/api/vehicles` endpoint
- ✅ **Database Indexes**: Optimized MongoDB queries with strategic indexes

### SEO
- ✅ **JSON-LD Structured Data**: Added Product/Offer schema for vehicle pages
- ✅ **Dynamic SEO Head**: Title, description, and image optimization per vehicle
- ✅ **Sitemap.xml**: Auto-generated sitemap with all vehicles and pages
- ✅ **Robots.txt**: Proper crawler directives and sitemap reference

### UX Improvements
- ✅ **Real-time Viewers**: Shows "Seja o primeiro a ver" when 0 users online
- ✅ **Image Placeholders**: LQIP (Low Quality Image Placeholder) for smooth loading
- ✅ **Performance Monitoring**: Health check endpoints and metrics

### DevOps & Security
- ✅ **Docker Support**: Multi-stage Dockerfile with Alpine Linux
- ✅ **Docker Compose**: Complete development and production setup
- ✅ **CI/CD Pipeline**: GitHub Actions with lint, type-check, test, and build
- ✅ **Nginx Configuration**: Reverse proxy with gzip, security headers, and rate limiting
- ✅ **Security Headers**: XSS protection, content security policy, and more

## 🛠️ Quick Start

### Development
```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Environment Variables
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/ja-automoveis
JWT_SECRET=your-super-secret-jwt-key

# Optional
NODE_ENV=production
PORT=5000
```

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.IO for live viewers
- **Deployment**: Docker, Nginx, GitHub Actions
- **Performance**: Sharp for image optimization, lazy loading, code splitting

## 📈 SEO Features

- Structured data (JSON-LD) for vehicles
- Dynamic meta tags and Open Graph
- Auto-generated sitemap.xml
- Optimized robots.txt
- Semantic HTML structure
- Fast loading times

## 🔒 Security Features

- JWT authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- Security headers via Nginx
- CORS configuration
- MongoDB injection protection

## 📝 API Documentation

See [API.md](./API.md) for detailed API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is proprietary software for JA Automóveis.