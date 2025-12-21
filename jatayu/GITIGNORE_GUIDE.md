# Bunker Project - Git Ignore Guide

## Overview
This guide explains the `.gitignore` configuration for the Bunker spatial intelligence platform, which includes a React frontend, Node.js backend, and Python TerraMind service.

## Project Structure
```
Bunker/
├── .gitignore                    # Root gitignore (comprehensive)
├── backend/
│   ├── .gitignore               # Backend-specific gitignore
│   ├── src/                     # ✅ INCLUDE: Source code
│   ├── package.json             # ✅ INCLUDE: Dependencies
│   ├── README.md                # ✅ INCLUDE: Documentation
│   └── env.example              # ✅ INCLUDE: Environment template
├── bunker/
│   ├── .gitignore               # Frontend-specific gitignore
│   ├── src/                     # ✅ INCLUDE: React source code
│   ├── public/                  # ✅ INCLUDE: Static assets
│   ├── package.json             # ✅ INCLUDE: Dependencies
│   ├── tsconfig.json            # ✅ INCLUDE: TypeScript config
│   ├── vite.config.ts           # ✅ INCLUDE: Build config
│   └── tailwind.config.js       # ✅ INCLUDE: Styling config
└── terramind-service/
    ├── .gitignore               # Python-specific gitignore
    ├── app.py                   # ✅ INCLUDE: Python source
    ├── requirements.txt         # ✅ INCLUDE: Python dependencies
    └── README.md                # ✅ INCLUDE: Documentation
```

## Files to INCLUDE (Essential for Project)
### Source Code
- All files in `src/` directories
- `*.ts`, `*.tsx`, `*.js`, `*.py` source files
- Component files and service files

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Build configuration
- `tailwind.config.js` - Styling configuration
- `eslint.config.js` - Code quality rules
- `postcss.config.js` - CSS processing

### Documentation
- `README.md` files
- `*.md` documentation files
- `SETUP.md`, `PROJECT_SUMMARY.md`

### Templates & Examples
- `env.example` - Environment variable templates
- `*.example` files

### Static Assets
- `public/` directory contents
- `vite.svg`, `react.svg` icons
- Small images and assets

## Files to EXCLUDE (Automatically Ignored)

### Dependencies & Build Outputs
```
node_modules/          # NPM dependencies (large)
dist/                  # Built application
build/                 # Build artifacts
coverage/              # Test coverage reports
```

### Environment & Secrets
```
.env                   # Environment variables (CRITICAL)
.env.local             # Local environment overrides
.env.production        # Production secrets
*.key                  # API keys and certificates
secrets/               # Secret files directory
```

### Logs & Debugging
```
*.log                  # All log files
logs/                  # Log directories
npm-debug.log*         # NPM debug logs
yarn-debug.log*        # Yarn debug logs
```

### Editor & IDE Files
```
.vscode/               # VS Code settings (except essential configs)
.idea/                 # IntelliJ IDEA files
*.sublime-*            # Sublime Text files
.DS_Store              # macOS system files
Thumbs.db              # Windows system files
```

### Python Specific (TerraMind Service)
```
__pycache__/           # Python bytecode cache
*.pyc                  # Compiled Python files
*.pyo                  # Optimized Python files
.venv/                 # Virtual environment
venv/                  # Virtual environment
```

### Temporary & Cache Files
```
.cache/                # Build caches
.tmp/                  # Temporary files
*.tmp                  # Temporary files
*.bak                  # Backup files
*.backup               # Backup files
```

### Testing & Quality Assurance
```
.eslintcache           # ESLint cache
.jest/                 # Jest cache
.pytest_cache/         # PyTest cache
```

## Security Considerations

### NEVER Commit These Files:
1. **Environment Variables** (`.env` files)
2. **API Keys** (`*.key`, `*.pem`, `*.crt`)
3. **Database Credentials**
4. **Secrets Directory**
5. **Production Configuration**

### Safe to Commit:
1. **Source Code** (all `.ts`, `.tsx`, `.js`, `.py` files)
2. **Configuration Templates** (`env.example`)
3. **Documentation** (`.md` files)
4. **Package Definitions** (`package.json`, `requirements.txt`)
5. **Build Configuration** (`tsconfig.json`, `vite.config.ts`)

## How to Use

### For New Contributors:
1. Clone the repository
2. Copy `env.example` to `.env` in both `backend/` and `bunker/` folders
3. Add your API keys to the `.env` files
4. Run `npm install` in both `backend/` and `bunker/` folders
5. Start development servers

### For Deployment:
1. Ensure all `.env` files are configured on the server
2. Never commit actual environment variables
3. Use environment variable injection in production
4. Verify that sensitive files are not in the repository

## Verification Commands

### Check what files are tracked:
```bash
git ls-files
```

### Check what files would be added (dry run):
```bash
git add . --dry-run
```

### Check for sensitive files:
```bash
# Search for potential secrets
grep -r "API_KEY\|SECRET\|PASSWORD" --include="*.js" --include="*.ts" --include="*.py" .
```

### Verify .gitignore is working:
```bash
# This should not show ignored files
git status --ignored
```

## Best Practices

1. **Always review** what you're committing with `git status`
2. **Use templates** like `env.example` for configuration
3. **Document** any new file types that should be ignored
4. **Update** `.gitignore` when adding new tools or frameworks
5. **Test** that sensitive files are properly ignored

## Troubleshooting

### If you accidentally committed sensitive files:
1. Remove them from git history:
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/sensitive/file' --prune-empty --tag-name-filter cat -- --all
   ```
2. Add them to `.gitignore`
3. Force push to update remote repository

### If build files are being tracked:
1. Remove them from git:
   ```bash
   git rm -r --cached dist/ build/ node_modules/
   ```
2. Add them to `.gitignore`
3. Commit the changes

---

**Remember**: When in doubt, err on the side of caution. It's better to exclude a file and add it later than to accidentally commit sensitive information.
