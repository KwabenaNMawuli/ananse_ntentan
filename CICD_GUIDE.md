# GitHub Actions CI/CD Tutorial for Ananse Ntentan

## 📚 Table of Contents
1. [What is CI/CD?](#what-is-cicd)
2. [Why GitHub Actions?](#why-github-actions)
3. [Setup Guide](#setup-guide)
4. [Understanding Your Workflows](#understanding-your-workflows)
5. [Customization Guide](#customization-guide)
6. [Deployment Platforms](#deployment-platforms)
7. [Testing & Debugging](#testing--debugging)
8. [Best Practices](#best-practices)

---

## What is CI/CD?

### Continuous Integration (CI)
- **Automated testing** every time you push code
- **Early bug detection** before code reaches production
- **Code quality checks** (linting, formatting, security)
- **Build validation** to ensure code compiles correctly

### Continuous Deployment (CD)
- **Automated deployment** to staging/production
- **Consistent deployment process** - no manual steps
- **Rollback capabilities** if issues arise
- **Environment-specific configurations**

### Benefits for Your Project
✅ **Catch bugs early** - Tests run automatically before merge  
✅ **Consistent builds** - Same process every time  
✅ **Faster deployment** - Push to main = automatic deploy  
✅ **Better collaboration** - Team members see test results  
✅ **Professional workflow** - Industry standard practice  

---

## Why GitHub Actions?

### Advantages
- ✅ **Free for public repos** (2,000 minutes/month for private)
- ✅ **Integrated with GitHub** - No external service needed
- ✅ **Easy to configure** - YAML-based configuration
- ✅ **Large marketplace** - Thousands of pre-built actions
- ✅ **Matrix builds** - Test multiple Node versions simultaneously

### Alternatives (for reference)
- **CircleCI** - More features, but complex
- **Travis CI** - Good for open source
- **Jenkins** - Self-hosted, requires setup
- **GitLab CI** - If using GitLab instead

---

## Setup Guide

### Step 1: Initialize Git Repository

```powershell
# Navigate to your project
cd "C:\Users\mccly\Desktop\My projects\ananse_ntentan"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit with CI/CD setup"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `ananse-ntentan`
3. Don't initialize with README (you already have files)
4. Copy the repository URL

### Step 3: Connect Local to GitHub

```powershell
# Add remote origin (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/ananse-ntentan.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify Workflow Files

Your workflows are already created in `.github/workflows/`:
- ✅ `frontend-ci.yml` - Frontend pipeline
- ✅ `backend-ci.yml` - Backend pipeline

These will automatically run when you push code!

### Step 5: Set Up Branch Protection (Recommended)

1. Go to your GitHub repo → **Settings** → **Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - Select: `Test Frontend` and `Test Backend`

---

## Understanding Your Workflows

### Frontend CI/CD Pipeline (`frontend-ci.yml`)

#### Workflow Structure
```yaml
on:
  push:
    branches: [ main, develop ]  # Triggers on push to these branches
    paths:
      - 'ananse_ntentan_frontend/**'  # Only runs if frontend files change
```

#### Jobs Breakdown

**1. Test Job** (`test`)
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]  # Tests on multiple Node versions
```
- ✅ Checks out your code
- ✅ Installs dependencies with `npm ci`
- ✅ Runs linting (code quality checks)
- ✅ Runs tests with coverage
- ✅ Uploads coverage reports

**2. Build Job** (`build`)
```yaml
needs: test  # Only runs if tests pass
```
- ✅ Builds production-ready code
- ✅ Treats warnings as warnings (not errors)
- ✅ Uploads build artifacts for deployment

**3. Security Job** (`security`)
- ✅ Runs `npm audit` for vulnerabilities
- ✅ Checks for known security issues
- ✅ Non-blocking (continues on error)

**4. Deploy to Staging** (`deploy-staging`)
```yaml
if: github.ref == 'refs/heads/develop'  # Only on develop branch
```
- ✅ Downloads build artifacts
- ✅ Deploys to staging environment
- ✅ Comments on PR with preview link

**5. Deploy to Production** (`deploy-production`)
```yaml
if: github.ref == 'refs/heads/main'  # Only on main branch
environment:
  name: production  # Requires approval if configured
```
- ✅ Deploys to production
- ✅ Creates deployment status
- ✅ Sends notifications

### Backend CI/CD Pipeline (`backend-ci.yml`)

#### Special Features

**MongoDB Service Container**
```yaml
services:
  mongodb:
    image: mongo:7.0  # Spins up MongoDB for testing
    ports:
      - 27017:27017
```
- ✅ Provides real database for integration tests
- ✅ Isolated test environment
- ✅ Health checks ensure database is ready

**Environment Variables**
```yaml
env:
  NODE_ENV: test
  MONGODB_URI: mongodb://localhost:27017/ananse_ntentan_test
  JWT_SECRET: test_secret_key
```
- ✅ Configures test environment
- ✅ Uses separate test database
- ✅ Test-specific secrets

---

## Customization Guide

### Adding Environment Variables

#### For Testing (Visible in Logs)
```yaml
- name: Run tests
  env:
    NODE_ENV: test
    API_URL: http://localhost:5000
```

#### For Production (Secret)
1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add secrets:
   - `MONGODB_URI` - Production database URL
   - `JWT_SECRET` - Secret key for JWT
   - `CLOUDINARY_API_KEY` - If using Cloudinary
   - `NETLIFY_AUTH_TOKEN` - For Netlify deployment

#### Using Secrets in Workflow
```yaml
- name: Deploy
  env:
    DATABASE_URL: ${{ secrets.MONGODB_URI }}
    JWT_SECRET: ${{ secrets.JWT_SECRET }}
  run: |
    # Your deployment commands
```

### Modifying Trigger Conditions

#### Run on Specific Branches
```yaml
on:
  push:
    branches:
      - main
      - develop
      - feature/*  # All feature branches
```

#### Run on Pull Requests Only
```yaml
on:
  pull_request:
    branches: [ main ]
```

#### Run on Schedule (Cron)
```yaml
on:
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
```

#### Manual Trigger
```yaml
on:
  workflow_dispatch:  # Adds "Run workflow" button in GitHub UI
```

### Adding Custom Steps

#### Example: Deploy to Netlify
```yaml
- name: Deploy to Netlify
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
  run: |
    npm install -g netlify-cli
    netlify deploy --prod --dir=build --auth=$NETLIFY_AUTH_TOKEN --site=$NETLIFY_SITE_ID
```

#### Example: Send Slack Notification
```yaml
- name: Notify Slack
  if: success()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "✅ Deployment successful!"
      }
```

#### Example: Create GitHub Release
```yaml
- name: Create Release
  if: startsWith(github.ref, 'refs/tags/')
  uses: actions/create-release@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    tag_name: ${{ github.ref }}
    release_name: Release ${{ github.ref }}
```

---

## Deployment Platforms

### Option 1: Netlify (Frontend) ⭐ Recommended for Beginners

#### Setup
1. Create account at [netlify.com](https://netlify.com)
2. Get auth token: Settings → Applications → Personal access tokens
3. Add to GitHub secrets as `NETLIFY_AUTH_TOKEN`
4. Update workflow:

```yaml
- name: Deploy to Netlify
  run: |
    npm install -g netlify-cli
    cd ananse_ntentan_frontend
    netlify deploy --prod --dir=build --auth=${{ secrets.NETLIFY_AUTH_TOKEN }}
```

**Pros:** Free tier, auto SSL, CDN, preview deployments  
**Cons:** Limited backend support

---

### Option 2: Vercel (Frontend) ⭐ Great for React

#### Setup
1. Create account at [vercel.com](https://vercel.com)
2. Install Vercel CLI: `npm i -g vercel`
3. Get token: Settings → Tokens
4. Add to secrets as `VERCEL_TOKEN`
5. Update workflow:

```yaml
- name: Deploy to Vercel
  run: |
    cd ananse_ntentan_frontend
    npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

**Pros:** Excellent performance, free tier, serverless functions  
**Cons:** Can be pricey for high traffic

---

### Option 3: Render (Frontend + Backend) ⭐ Best All-in-One

#### Setup
1. Create account at [render.com](https://render.com)
2. Create Web Service for frontend
3. Create Web Service for backend
4. Get deploy hooks from Settings
5. Add to secrets:
   - `RENDER_FRONTEND_DEPLOY_HOOK`
   - `RENDER_BACKEND_DEPLOY_HOOK`
6. Update workflow:

```yaml
- name: Deploy to Render
  run: |
    curl -X POST ${{ secrets.RENDER_FRONTEND_DEPLOY_HOOK }}
```

**Pros:** Free tier, handles frontend + backend, PostgreSQL/MongoDB  
**Cons:** Slower than Vercel/Netlify on free tier

---

### Option 4: Railway (Backend) ⭐ Best for Node.js Backend

#### Setup
1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login and get token: `railway login`
4. Add token to secrets as `RAILWAY_TOKEN`
5. Update workflow:

```yaml
- name: Deploy to Railway
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  run: |
    cd ananse_ntentan_backend
    npm install -g @railway/cli
    railway up
```

**Pros:** Great free tier, easy database setup, auto SSL  
**Cons:** Limited to specific regions

---

### Option 5: Heroku (Backend)

#### Setup
1. Create account at [heroku.com](https://heroku.com)
2. Get API key from Account Settings
3. Add to secrets as `HEROKU_API_KEY`
4. Create apps: `ananse-ntentan-backend`
5. Update workflow:

```yaml
- name: Deploy to Heroku
  env:
    HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
  run: |
    cd ananse_ntentan_backend
    git push https://heroku:$HEROKU_API_KEY@git.heroku.com/ananse-ntentan-backend.git main
```

**Pros:** Mature platform, good docs  
**Cons:** Free tier removed (requires payment)

---

### Option 6: AWS S3 + CloudFront (Frontend)

#### Setup (Advanced)
1. Create S3 bucket for static hosting
2. Create CloudFront distribution
3. Add AWS credentials to secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
4. Update workflow:

```yaml
- name: Deploy to AWS
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: us-east-1
  run: |
    cd ananse_ntentan_frontend/build
    aws s3 sync . s3://your-bucket-name --delete
    aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

**Pros:** Highly scalable, powerful  
**Cons:** Complex setup, costs can add up

---

## Testing & Debugging

### Running Workflows Locally

#### Install act (Local GitHub Actions)
```powershell
# Using Chocolatey
choco install act-cli

# Using Scoop
scoop install act
```

#### Run Workflow Locally
```powershell
# Test frontend workflow
act -W .github/workflows/frontend-ci.yml

# Test specific job
act -j test -W .github/workflows/frontend-ci.yml

# With secrets
act --secret-file .secrets -W .github/workflows/frontend-ci.yml
```

### Viewing Workflow Runs

1. Go to your GitHub repo
2. Click **Actions** tab
3. See all workflow runs
4. Click on a run to see logs
5. Click on a job to see detailed logs

### Common Issues & Solutions

#### Issue: Tests Fail in CI but Pass Locally
**Solution:**
```yaml
# Make tests deterministic
- name: Run tests
  env:
    TZ: UTC  # Set timezone
    NODE_ENV: test
  run: npm test -- --maxWorkers=2  # Limit concurrency
```

#### Issue: Build Runs Out of Memory
**Solution:**
```yaml
- name: Build with more memory
  env:
    NODE_OPTIONS: --max_old_space_size=4096
  run: npm run build
```

#### Issue: Workflow Doesn't Trigger
**Solution:**
- Check branch names match
- Verify file paths are correct
- Ensure workflow is on correct branch
- Check workflow syntax: [YAML validator](https://www.yamllint.com/)

#### Issue: Secrets Not Working
**Solution:**
- Verify secret names match exactly (case-sensitive)
- Secrets aren't available in forked repos
- Check secret isn't empty
- Use: `echo "Secret length: ${#MY_SECRET}"` to debug (don't echo actual secret!)

---

## Best Practices

### 1. Use Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/new-feature (development)
```

**Workflow:**
1. Create feature branch: `git checkout -b feature/audio-processing`
2. Make changes and commit
3. Push: `git push origin feature/audio-processing`
4. Open PR to `develop`
5. CI runs tests automatically
6. Merge to `develop` → auto-deploy to staging
7. Test on staging
8. Merge `develop` to `main` → auto-deploy to production

### 2. Protect Production

```yaml
deploy-production:
  environment:
    name: production
    url: https://ananse-ntentan.com
  # Requires manual approval before deployment
```

**Setup in GitHub:**
- Settings → Environments → New environment: "production"
- Add protection rules: Required reviewers
- Now production deploys need approval!

### 3. Cache Dependencies

```yaml
- name: Cache node modules
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Benefits:**
- ⚡ Faster builds (2-3x speed improvement)
- 💰 Reduced costs (less compute time)

### 4. Fail Fast

```yaml
strategy:
  fail-fast: true  # Stop all jobs if one fails
  matrix:
    node-version: [18.x, 20.x]
```

### 5. Use Conditions Wisely

```yaml
# Only deploy on main branch
if: github.ref == 'refs/heads/main'

# Only run on push, not PR
if: github.event_name == 'push'

# Only if tests passed
if: success()

# Only if previous step failed
if: failure()

# Always run (even if other steps fail)
if: always()
```

### 6. Separate Concerns

```yaml
# Don't do this:
- name: Test and deploy
  run: |
    npm test
    npm run build
    npm run deploy

# Do this:
- name: Test
  run: npm test
  
- name: Build
  run: npm run build
  
- name: Deploy
  run: npm run deploy
```

### 7. Version Lock

```yaml
# Don't use latest
- uses: actions/checkout@latest  ❌

# Use specific version
- uses: actions/checkout@v4  ✅
```

### 8. Meaningful Job Names

```yaml
# Bad
jobs:
  job1:
    name: Test

# Good
jobs:
  test-frontend:
    name: Test Frontend (Node ${{ matrix.node-version }})
```

---

## Quick Start Checklist

### Before First Push
- [ ] Review workflow files
- [ ] Update deployment commands with your platform
- [ ] Add necessary secrets to GitHub
- [ ] Test locally with `act` (optional)
- [ ] Update notification URLs (Slack, Discord, etc.)

### Initial Setup
- [ ] Create GitHub repository
- [ ] Push code with workflow files
- [ ] Verify workflows appear in Actions tab
- [ ] Set up branch protection rules
- [ ] Configure deployment environments

### First Deployment
- [ ] Push to `develop` branch
- [ ] Watch workflow run in Actions tab
- [ ] Check staging deployment
- [ ] Fix any issues
- [ ] Merge to `main`
- [ ] Verify production deployment

---

## Additional Resources

### Official Documentation
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

### Useful Actions
- [actions/checkout](https://github.com/actions/checkout) - Check out code
- [actions/setup-node](https://github.com/actions/setup-node) - Setup Node.js
- [actions/cache](https://github.com/actions/cache) - Cache dependencies
- [codecov/codecov-action](https://github.com/codecov/codecov-action) - Upload coverage

### Learning Resources
- [GitHub Actions Tutorial](https://github.com/skills/hello-github-actions)
- [Awesome Actions](https://github.com/sdras/awesome-actions)

---

## Summary

### What You've Gained
✅ **Automated Testing** - Every push runs tests  
✅ **Automated Deployment** - Push to main = live in production  
✅ **Security Scanning** - Vulnerabilities caught early  
✅ **Professional Workflow** - Industry-standard CI/CD  
✅ **Quality Assurance** - Code must pass tests to merge  

### Next Steps
1. **Choose your deployment platform** (Render, Netlify, Vercel, etc.)
2. **Set up secrets** in GitHub repository settings
3. **Update deployment commands** in workflow files
4. **Push to develop** to test staging deployment
5. **Monitor Actions tab** to see workflows in action
6. **Iterate and improve** as your project grows

---

**Your CI/CD is ready to go! 🚀**

When you push code to GitHub, your workflows will automatically:
- Run tests
- Check for security issues  
- Build production code
- Deploy to staging (develop branch)
- Deploy to production (main branch)

**Need help?** Check the [GitHub Actions documentation](https://docs.github.com/en/actions) or the workflow logs in the Actions tab.
