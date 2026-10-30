# [Feature Name] - Feature Documentation

**Status:** 🔴 Planned | 🟡 In Progress | 🟢 Complete  
**Progress:** 0%  
**Last Updated:** [Date]  
**Owner:** [Developer/Team]

---

## Overview

### Purpose
[2-3 sentences describing what this feature does and why it exists]

### User Stories
- As a [user type], I want to [action] so that [benefit]
- As a [user type], I want to [action] so that [benefit]

---

## User Experience

### User Flow
```
1. User [action]
2. App [response]
3. User [next action]
4. App [final state]
```

### Screens/Views
- **[ScreenName]**: [Purpose]
  - Entry point: [Navigation path]
  - Exit points: [Where user can go]
  - Key interactions: [Buttons, gestures, etc.]

---

## Technical Specification

### Components
| Component | Location | Purpose | Status |
|-----------|----------|---------|--------|
| [ComponentName] | `/src/features/[feature]/components/` | [Purpose] | ⬜ Not Started |
| [ScreenName] | `/src/features/[feature]/screens/` | [Purpose] | ⬜ Not Started |

### Hooks
| Hook | Purpose | Dependencies |
|------|---------|--------------|
| `use[FeatureName]Data` | Fetch and manage feature data | React Query, featureApi |
| `use[FeatureName]Actions` | Handle user actions | featureApi, navigation |

### API Integration

**Base Endpoint:** `/api/[resource]`

#### Endpoints Used
```typescript
GET    /api/[resource]           // List all
GET    /api/[resource]/:id       // Get single
POST   /api/[resource]           // Create
PATCH  /api/[resource]/:id       // Update
DELETE /api/[resource]/:id       // Delete
```

#### Request/Response Types
```typescript
interface FeatureRequest {
  // Request payload structure
}

interface FeatureResponse {
  // Response data structure
}

interface FeatureError {
  // Error structure
}
```

### State Management
[Describe what state is needed and how it's managed]
- **Global State:** [What goes in global store]
- **Local State:** [What stays in components]
- **Cached Data:** [What's cached and invalidation strategy]

### Data Models
```typescript
interface FeatureModel {
  id: string;
  // ... other fields
  createdAt: string;
  updatedAt: string;
}
```

---

## Navigation

### Routes Added
```typescript
type FeatureStackParamList = {
  FeatureHome: undefined;
  FeatureDetail: { id: string };
  FeatureEdit: { id: string };
};
```

### Integration with App Navigation
- Entry points: [Where in app navigation this feature is accessed]
- Deep linking: [Any deep link support needed]

---

## Dependencies

### New Packages Required
- `[package-name]@[version]`: [Why needed]

### Shared Utilities Needed
- `[utility-name]`: [Purpose]

---

## Design Specifications

### Theme Tokens Used
- Colors: `colors.primary.main`, `colors.background.secondary`
- Spacing: `spacing.md`, `spacing.lg`
- Typography: `typography.heading2`, `typography.body`

### Custom Styles
[Any feature-specific styling that doesn't use shared theme]

### Assets Required
- [ ] Icon: [icon-name]
- [ ] Illustration: [illustration-name]
- [ ] Image: [image-description]

---

## Error Handling

### Expected Errors
| Error Scenario | User Message | Recovery Action |
|----------------|--------------|-----------------|
| Network failure | "Connection lost. Please try again." | Retry button |
| Invalid input | "[Field] is invalid" | Highlight field |
| Permission denied | "You don't have permission" | Navigate back |

### Edge Cases
- [ ] No data available
- [ ] Slow network
- [ ] Offline mode
- [ ] Large dataset (pagination)

---

## Testing Requirements

### Unit Tests
- [ ] Component rendering
- [ ] Hook logic
- [ ] Utility functions
- [ ] Error handling

### Integration Tests
- [ ] API calls
- [ ] Navigation flow
- [ ] State updates

### E2E Tests
- [ ] Complete user flow
- [ ] Error scenarios

---

## Performance Considerations

### Optimization Strategies
- [ ] Memoization for expensive computations
- [ ] Virtualized lists if > 50 items
- [ ] Image optimization
- [ ] Debounced search/input
- [ ] Lazy loading for heavy components

### Metrics to Monitor
- Initial render time: < [X]ms
- List scroll performance: 60fps
- API response handling: < [X]ms

---

## Security Considerations

- [ ] Input validation
- [ ] Authentication required
- [ ] Authorization checks
- [ ] Sensitive data handling
- [ ] Rate limiting

---

## Accessibility

- [ ] Screen reader support
- [ ] Sufficient color contrast
- [ ] Touch target sizes (min 44x44)
- [ ] Focus management
- [ ] Alternative text for images

---

## Implementation Notes

### Phase 1: Foundation (Status: ⬜)
- [ ] Create feature directory structure
- [ ] Set up basic components
- [ ] Define types and interfaces
- [ ] Create API service

### Phase 2: Core Functionality (Status: ⬜)
- [ ] Implement data fetching
- [ ] Build main screens
- [ ] Add navigation
- [ ] Implement user actions

### Phase 3: Polish (Status: ⬜)
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Animations

### Phase 4: Testing & Optimization (Status: ⬜)
- [ ] Write tests
- [ ] Performance optimization
- [ ] Accessibility review
- [ ] Security review

---

## Open Questions
- [ ] Question 1?
- [ ] Question 2?

---

## Implementation Log

### [Date] - Initial Setup
- Created feature directory structure
- Defined base types
- Set up navigation

### [Date] - [Milestone]
- [What was implemented]
- [Any challenges encountered]
- [Solutions applied]

---

## Future Enhancements
- [ ] Enhancement 1
- [ ] Enhancement 2

---

## Related Documentation
- API Documentation: `/docs/architecture/API.md`
- Navigation: `/docs/architecture/NAVIGATION.md`
- Contributing Guide: `CONTRIBUTING.md`

---

**Notes for Claude Code:**
- Update "Status" and "Progress" as implementation advances
- Add to "Implementation Log" after each significant change
- Mark tasks complete with ✅
- Update component/hook status as they're built
- Add any deviations from plan to "Implementation Notes"
