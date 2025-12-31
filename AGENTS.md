# Hezaerd.com - Project Context & Rules

## Project Overview

- **Purpose**: Game programmer's portfolio website
- **Stack**: React 19 + TypeScript + TanStack Router + TanStack Start (SSR)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Package Manager**: Bun (preferred)
- **Linting/Formatting**: Oxlint and Oxfmt

## Architecture Principles

- Clean architecture: separate code across multiple files, not monolithic files
- Prefer shadcn/ui components (use shadcn MCP to interact with global registry)
- Use Bun for all scripts and package management

## Tech Stack Details

- **Framework**: Tanstack Start (SSR)
- **Routing**: TanStack Router/Start with file-based routing
- **State Management**: TanStack Query (React Query)
- **Animations**: Motion (Framer Motion)
- **UI Framework**: shadcn/ui with Base UI React (using shadcn MCP to interact with global registry)
- **Icons**: Phosphor Icons

## Code Style

- Use Oxlint and Oxfmt for formatting (already configured)
- TypeScript strict mode
- Prefer functional components with hooks
- Use Zod for validation

## File Structure

- Routes: `src/routes/` (TanStack Router/Start file-based)
- Components: `src/components/` (organized by feature/domain)
- Lib/Utils: `src/lib/`

## Environment

- Dev server: `bun dev` (runs on port 3000)

## When Making Changes

- Always use Bun commands
- Run `bun check` before committing
- Use shadcn MCP for component installation
- Keep components modular and separated
- Follow existing patterns for routes
