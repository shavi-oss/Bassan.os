# Contributing to Bassan.os

## Document Control

- **Document Title**: Contributing Guide
- **Version**: 2.2
- **Status**: Approved
- **Date**: 2026-01-08

---

## Welcome!

First off, thank you for considering contributing to Bassan.os! It's people like you that make Bassan.os such a great tool.

This document contains guidelines for contributing to the Bassan.os project. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [How Can I Contribute?](#3-how-can-i-contribute)
4. [Pull Request Process](#4-pull-request-process)
5. [Styleguides](#5-styleguides)

---

## 1. Code of Conduct

This project and everyone participating in it is governed by the [Bassan.os Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

We are committed to providing a welcoming and inspiring community for all.

---

## 2. Getting Started

### 2.1 Prerequisites

- Node.js 18+
- PostgreSQL 16
- Redis 7
- Docker Desktop
- Git

### 2.2 Development Environment

1. **Fork and Clone**:

   ```bash
   git clone https://github.com/YOUR-USERNAME/bassan-os.git
   cd bassan-os
   ```

2. **Install Dependencies**:

   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set Up Environment**:

   ```bash
   # Copy example env files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start Services**:

   ```bash
   # Start DB and Redis
   docker-compose up -d postgres redis

   # Run migrations
   cd backend && npm run db:migrate
   ```

5. **Start Development Servers**:

   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

---

## 3. How Can I Contribute?

### 3.1 Reporting Bugs

Before creating bug reports, please check the existing issues list as you might find out that you don't need to create one. When you are creating a bug report, please relate the issue to a **user story** if possible.

**Bug Report Template**: [BUG_REPORT_TEMPLATE.md](.github/ISSUE_TEMPLATE/bug_report.md)

### 3.2 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please focus on the value it provides to the user.

**Feature Request Template**: [FEATURE_REQUEST_TEMPLATE.md](.github/ISSUE_TEMPLATE/feature_request.md)

### 3.3 Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `good-first-issue` and `help-wanted` issues:

- [Good First Issues](https://github.com/bassan-os/bassan-os/labels/good-first-issue) - issues which should only require a few lines of code, and a test or two.
- [Help Wanted](https://github.com/bassan-os/bassan-os/labels/help-wanted) - issues which should be a bit more involved than `good-first-issue`.

---

## 4. Pull Request Process

1. **Create a Branch**: Create a branch from `develop`.

   ```bash
   git checkout -b feature/issue-number-description
   ```

2. **Commit Changes**: Make sure your code lints and tests pass.

   ```bash
   npm run lint
   npm run test
   ```

3. **Push to GitHub**:

   ```bash
   git push origin feature/issue-number-description
   ```

4. **Open a Pull Request**:

   - Fill out the PR template.
   - Link the relevant issue (e.g., `Closes #123`).
   - Request a review from a team member.

5. **Code Review**:
   - Address any comments or questions.
   - Once approved, your PR will be squash-merged into `develop`.

---

## 5. Styleguides

### 5.1 Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- Follow conventional commits:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation changes
  - `style:` for formatting changes
  - `refactor:` for refactoring code
  - `test:` for adding missing tests
  - `chore:` for maintenance tasks

### 5.2 Code Style

- **TypeScript**: Use strict typing, no `any`.
- **Formatting**: We use Prettier. Run `npm run format` before committing.
- **Linting**: We use ESLint. Run `npm run lint` to check for issues.

### 5.3 Documentation Style

- Use Markdown.
- Limit line length to 80 characters where possible.
- Use headers to structure your document.
- Use code blocks for commands and code snippets.

---

**Thank you for contributing!**
