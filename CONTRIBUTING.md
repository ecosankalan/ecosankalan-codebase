# Contributing to EcoSankalan

> Internal guide for the EcoSankalan team — NSUT CPVS-STP 2025-26(E)

---

## Branch Strategy

We use a simplified **Gitflow** strategy:

```
main
 └── dev
      ├── feature/auth-jwt          ← Ayush
      ├── feature/mongodb-schemas   ← Atishay
      ├── feature/react-scaffold    ← Vipin
      └── feature/figma-export      ← Krishna
```

| Branch | Purpose | Who merges here? |
|--------|---------|-----------------|
| `main` | Production-ready, deployed code | Ayush (Team Lead) only |
| `dev` | Integration — all features merge here first | PR from feature branches |
| `feature/*` | Your working branch | You, alone |

**Rule:** No one pushes directly to `main` or `dev`. Always open a Pull Request.

---

## Workflow for Every Task

```bash
# 1. Always start from the latest dev
git checkout dev
git pull origin dev

# 2. Create your feature branch
git checkout -b feature/your-feature-name

# 3. Work, commit often with meaningful messages
git add .
git commit -m "feat(auth): add JWT middleware with role-based access"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request → dev (NOT main)
#    Title: [FEAT] Add JWT middleware
#    Description: What you built, how to test it
```

---

## Commit Message Format

Use this format so the Git history is readable:

```
type(scope): short description

Examples:
feat(auth): add OTP verification via MSG91
fix(waste): correct eco-points calculation for e-waste
docs(readme): update API table with Month 3 routes
test(auth): add unit tests for login route
refactor(db): extract connection logic to config/database.js
chore(deps): update mongoose to 8.5.1
```

**Types:** `feat` | `fix` | `docs` | `test` | `refactor` | `chore`

---

## Pull Request Rules

1. **PR title** must follow commit format: `[FEAT] Add JWT auth middleware`
2. **Description** must include: what was built, how to test it
3. **At least one reviewer** — tag Ayush on all PRs
4. **No PR merges if tests fail** — run `npm test` before opening a PR
5. **No secrets in code** — no API keys, passwords, or tokens in any file

---

## Code Style

- Use `const` over `let` where possible; never `var`
- Always handle errors — no empty catch blocks
- Every route must have a try/catch or use an async wrapper
- Use `process.env.VARIABLE_NAME` for all config — never hardcode
- Add a comment above any function that isn't self-explanatory

---

## Environment Setup

```bash
git clone https://github.com/ecosankalan/ecosankalan-codebase.git
cd ecosankalan-codebase
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

Test the server: `GET http://localhost:5000/health`

---

## Team Contacts

| Member | Role | Branch prefix |
|--------|------|--------------|
| Ayush (2024UCS1573) | Team Lead, Backend | `feature/backend-*` |
| Atishay (2024UCS1510) | MongoDB, Deployment | `feature/db-*` |
| Vipin (2024UCS1607) | Frontend React | `feature/frontend-*` |
| Krishna (2024UCS1548) | UI/UX | `feature/ui-*` |
| Bhagya (2024UCS2135) | Research, Content | `docs/*` |
