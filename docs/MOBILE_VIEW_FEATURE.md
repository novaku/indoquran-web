# Mobile App View Toggle Feature

## Overview
The Mobile App View Toggle feature allows users to switch between the default web view and a mobile-optimized app-like experience. This feature enhances the user experience for mobile users by providing a more focused, distraction-free reading environment.

## Features

### 🔄 Toggle Functionality
- **Visual Toggle Button**: Located in the header with custom mobile/desktop icons
- **Keyboard Shortcut**: `Ctrl+M` (or `Cmd+M` on Mac) for quick toggling
- **State Persistence**: User preference is saved in localStorage
- **Toast Notifications**: Provides feedback when toggling between modes

### 📱 Mobile App View Optimizations
- **Safe Area Support**: Compatible with modern devices with notches/dynamic islands
- **Enhanced Touch Targets**: Minimum 44px touch targets for accessibility
- **Smooth Scrolling**: Momentum scrolling for better mobile experience
- **Focused Layout**: Optimized spacing and typography for reading
- **Loading Optimizations**: Enhanced loading states and animations

### ♿ Accessibility Features
- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: Proper ARIA labels and announcements
- **High Contrast**: Enhanced focus states for better visibility
- **Touch Accessibility**: Improved touch target sizes

## Implementation

### Context Provider
- **Location**: `/src/contexts/MobileViewContext.tsx`
- **Features**: 
  - State management with localStorage persistence
  - Body class manipulation for CSS targeting
  - Keyboard event handling
  - Custom event dispatching
  - Viewport meta tag management

### Header Integration
- **Location**: `/src/components/Header.tsx`
- **Features**:
  - Toggle button with custom icons
  - Tooltip with keyboard shortcut information
  - Toast notification integration

### CSS Styles
- **Location**: `/src/app/globals.css`
- **Mobile Optimizations**:
  ```css
  /* Safe area support */
  .mobile-app-view {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  /* Enhanced touch targets */
  .mobile-app-view button {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Smooth scrolling */
  .mobile-app-view {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
  ```

## Usage

### For Users
1. **Toggle via Button**: Click the mobile/desktop icon in the header
2. **Toggle via Keyboard**: Press `Ctrl+M` (or `Cmd+M` on Mac)
3. **Visual Feedback**: Toast notification confirms the mode change
4. **Persistent Setting**: Your preference is remembered across sessions

### For Developers
```tsx
// Using the context in components
import { useMobileView } from '@/contexts/MobileViewContext';

function MyComponent() {
  const { isMobileView, toggleMobileView } = useMobileView();
  
  return (
    <div className={isMobileView ? 'mobile-optimized' : 'desktop-layout'}>
      <button onClick={toggleMobileView}>
        Toggle View
      </button>
    </div>
  );
}
```

## Browser Support
- ✅ Chrome/Chromium (Android, Desktop)
- ✅ Safari (iOS, macOS)
- ✅ Firefox (Android, Desktop)
- ✅ Edge (Windows, Android)

## Testing Status

### ✅ Completed Tests
- [x] Development server compilation
- [x] Context provider functionality
- [x] Header component integration
- [x] CSS styles application
- [x] State persistence (localStorage)
- [x] Navigation between pages
- [x] API integration (no conflicts)
- [x] Keyboard shortcuts
- [x] Toast notifications

### 📋 Manual Testing Checklist
- [x] Toggle button appears in header
- [x] Clicking toggle changes view mode
- [x] Keyboard shortcut (Ctrl+M) works
- [x] Toast notifications appear
- [x] Settings persist after page reload
- [x] Works across different pages (home, surah pages)
- [x] No console errors
- [x] Responsive design maintained

## Performance Impact
- **Bundle Size**: Minimal impact (~2KB additional code)
- **Runtime Performance**: No noticeable performance degradation
- **Memory Usage**: Negligible increase
- **Battery Impact**: No additional battery drain

## Future Enhancements
1. **PWA Integration**: Enhanced when used with Progressive Web App features
2. **Gesture Support**: Swipe gestures for navigation
3. **Reading Mode**: Additional reading-focused optimizations
4. **Custom Themes**: Mobile-specific color schemes
5. **Offline Support**: Enhanced offline reading experience

## Troubleshooting

### Common Issues
1. **Toggle not working**: Check if JavaScript is enabled
2. **Settings not persisting**: Verify localStorage is available
3. **Keyboard shortcut conflicts**: Check for browser extension conflicts
4. **Styling issues**: Clear browser cache and check CSS loading

### Debug Information
- View current state: Check `localStorage.getItem('mobileAppView')`
- Console logging: Enable debug mode in development
- CSS classes: Inspect `document.body.classList` for `mobile-app-view`

## Contributing
When modifying the mobile view feature:
1. Test on actual mobile devices
2. Verify keyboard accessibility
3. Check localStorage persistence
4. Validate CSS optimizations
5. Update this documentation

---

**Last Updated**: December 2024  
**Version**: 1.0.0  
**Tested On**: Chrome 120+, Safari 17+, Firefox 121+
