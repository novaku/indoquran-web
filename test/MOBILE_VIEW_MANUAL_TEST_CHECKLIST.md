# Mobile App View Feature - Manual Testing Checklist

## Pre-Testing Setup
- [ ] Development server is running (`npm run dev`)
- [ ] Browser is open to `http://localhost:3000`
- [ ] Developer tools are open (F12)
- [ ] Console is clear of errors

## Basic Functionality Tests

### Toggle Button Tests
- [ ] Toggle button is visible in the header
- [ ] Button shows correct icon (mobile or desktop)
- [ ] Button has proper tooltip/title text
- [ ] Button is accessible via keyboard (Tab navigation)
- [ ] Clicking button triggers mode change
- [ ] Button icon changes after toggle
- [ ] Button responds to hover states

### Keyboard Shortcut Tests
- [ ] `Ctrl+M` (Windows/Linux) toggles mobile view
- [ ] `Cmd+M` (Mac) toggles mobile view
- [ ] Keyboard shortcut works on all pages
- [ ] Shortcut doesn't conflict with browser shortcuts
- [ ] Focus management works correctly after toggle

### Visual Changes Tests
- [ ] Page layout changes when mobile view is activated
- [ ] Body element gets `mobile-app-view` class
- [ ] CSS styles are applied correctly in mobile view
- [ ] Responsive design still works in both modes
- [ ] Typography and spacing adjust appropriately
- [ ] Touch targets are appropriately sized (44px minimum)

### State Persistence Tests
- [ ] Mobile view preference saves to localStorage
- [ ] Setting persists after page refresh
- [ ] Setting persists when navigating between pages
- [ ] Setting persists after browser restart
- [ ] localStorage key is `mobileAppView`

### Toast Notification Tests
- [ ] Toast appears when toggling to mobile view
- [ ] Toast appears when toggling to desktop view
- [ ] Toast messages are appropriate and clear
- [ ] Toast notifications are accessible
- [ ] Multiple toggles don't stack notifications

### Cross-Page Navigation Tests
- [ ] Mobile view works on home page (`/`)
- [ ] Mobile view works on surah pages (`/surah/1`, `/surah/2`)
- [ ] Setting maintains across page navigation
- [ ] No layout shifts when navigating between pages
- [ ] All interactive elements remain functional

## Advanced Testing

### Mobile Device Testing
- [ ] Test on actual mobile device (Android/iOS)
- [ ] Test on tablet device
- [ ] Test with device rotation
- [ ] Test with browser zoom (50%, 100%, 150%, 200%)
- [ ] Test touch interactions on mobile devices

### Browser Compatibility
- [ ] Chrome/Chromium (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (Chrome Mobile, Safari Mobile)

### Accessibility Testing
- [ ] Screen reader announces mode changes
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Color contrast is sufficient
- [ ] ARIA attributes are properly set
- [ ] Touch targets meet WCAG guidelines (44px)

### Performance Testing
- [ ] No console errors when toggling
- [ ] No memory leaks after multiple toggles
- [ ] Smooth animations and transitions
- [ ] Fast localStorage read/write operations
- [ ] No impact on page load times

### Error Scenarios
- [ ] Works when localStorage is disabled
- [ ] Graceful fallback when JavaScript is disabled
- [ ] Works with browser extensions installed
- [ ] Works in incognito/private browsing mode
- [ ] Handles rapid toggle clicks gracefully

## Integration Testing

### API Integration
- [ ] API calls work correctly in both modes
- [ ] User authentication persists
- [ ] Bookmarks and favorites function normally
- [ ] Reading position tracking works
- [ ] Notes functionality is unaffected

### Component Integration
- [ ] Header component integrates properly
- [ ] Footer remains functional
- [ ] Sidebar (if present) adapts correctly
- [ ] Modal dialogs work in both modes
- [ ] Search functionality is unaffected

## Edge Cases

### Special Scenarios
- [ ] Very long content pages
- [ ] Pages with many interactive elements
- [ ] Pages with embedded media
- [ ] Pages with forms
- [ ] Print preview functionality

### Error Recovery
- [ ] Toggle works after network errors
- [ ] Recovers from corrupted localStorage
- [ ] Works with disabled cookies
- [ ] Functions with limited JavaScript permissions

## Sign-off

### Development Testing
- [ ] All functionality tests passed
- [ ] No console errors
- [ ] Code follows best practices
- [ ] Documentation is updated

### QA Testing
- [ ] Cross-browser testing completed
- [ ] Mobile device testing completed
- [ ] Accessibility testing completed
- [ ] Performance testing completed

### User Acceptance
- [ ] Feature meets requirements
- [ ] User experience is intuitive
- [ ] Performance is acceptable
- [ ] No breaking changes to existing functionality

---

**Tested By**: ________________  
**Date**: ________________  
**Browser/Device**: ________________  
**Notes**: ________________

### Test Results Summary
- **Total Tests**: ___ / ___
- **Passed**: ___
- **Failed**: ___
- **Status**: ✅ PASS / ❌ FAIL

### Issues Found
1. ________________
2. ________________
3. ________________

### Recommendations
1. ________________
2. ________________
3. ________________
