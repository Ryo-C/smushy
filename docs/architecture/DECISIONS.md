# Architecture Decision Records (ADRs)

## Status

This file will contain detailed Architecture Decision Records (ADRs) after the initial git commit when the baseline architecture is confirmed.

**ADR Format:** Newest decisions first (reverse chronological)

---

## Current Architecture Decisions

The following architectural decisions are currently in place and will be formalized as proper ADRs with dates and full context after the first commit:

### Infrastructure Organization
- **Core vs Libs Separation** - `/src/core` for domain infrastructure, `/src/libs` for third-party abstractions
- Enables swappable dependencies and clear separation of concerns

### Data Access
- **Repository Pattern** - Data access through repository interfaces with dual implementations (mock/backend)
- **Dependency Injection** - RepositoryProvider injects correct implementation based on environment
- **Dual-Mode Architecture** - Mock mode for development, backend mode for production

### Code Organization
- **Feature-Based Structure** - Self-contained modules in `/src/features` with screens, components, api, types
- **Tests Co-Located** - Tests live next to source files for better discoverability
- **Thin Routes** - `/src/app` contains only routing logic, business logic in feature screens

### State Management
- **Three-Tier Strategy** - TanStack Query for server state, Zustand for app-level client state, useState for component-local state
- Right tool for each job

### Styling & UI
- **NativeWind** - Tailwind CSS for React Native, compile-time styles with zero runtime cost

---

## Future ADRs

After the first git commit, detailed ADRs will be added here in reverse chronological order (newest first).

Each ADR will follow this template:

```markdown
## ADR-XXX: [Decision Title]

**Status:** Accepted/Proposed/Deprecated
**Date:** YYYY-MM-DD

### Context
[Why was this decision needed? What problem does it solve?]

### Decision
[What was decided? Include key details and rationale.]

### Consequences

**Positive:**
- [Benefits and advantages]

**Negative:**
- [Trade-offs and costs]

**Mitigation:**
- [How to address the negatives]
```

---

## References

**For detailed architecture information, see:**
- [OVERVIEW.md](./OVERVIEW.md) - High-level architecture patterns and principles
- [LAYERS.md](./LAYERS.md) - Layer separation and dependency rules

**External Resources:**
- [Architecture Decision Records](https://adr.github.io/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Clean Architecture (Uncle Bob)](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
