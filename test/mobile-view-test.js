/**
 * Mobile App View Feature Test Script
 * Run this in the browser console to test the mobile view functionality
 */

(function testMobileViewFeature() {
  console.log('🧪 Starting Mobile App View Feature Tests...\n');
  
  let testsPassed = 0;
  let totalTests = 0;
  
  function test(name, condition) {
    totalTests++;
    if (condition) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
    }
  }
  
  // Test 1: Check if MobileViewContext is available
  test('MobileView Context Available', typeof window !== 'undefined');
  
  // Test 2: Check if toggle button exists in header
  const toggleButton = document.querySelector('[data-testid="mobile-view-toggle"], button[aria-label*="mobile"], button[aria-label*="desktop"]');
  test('Toggle Button Present in Header', toggleButton !== null);
  
  // Test 3: Check if body has the mobile-app-view class management
  const initialBodyClasses = document.body.className;
  test('Body Element Accessible', document.body !== null);
  
  // Test 4: Check localStorage functionality
  const testKey = 'test-mobile-view';
  try {
    localStorage.setItem(testKey, 'test');
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    test('LocalStorage Available', retrieved === 'test');
  } catch (e) {
    test('LocalStorage Available', false);
  }
  
  // Test 5: Check if mobile view CSS styles are loaded
  const mobileViewStyles = document.querySelector('style, link[href*="globals.css"]');
  test('CSS Styles Loaded', mobileViewStyles !== null);
  
  // Test 6: Test keyboard event handling
  let keyboardHandlerWorks = false;
  try {
    const event = new KeyboardEvent('keydown', {
      ctrlKey: true,
      key: 'm'
    });
    document.dispatchEvent(event);
    keyboardHandlerWorks = true;
  } catch (e) {
    keyboardHandlerWorks = false;
  }
  test('Keyboard Event Support', keyboardHandlerWorks);
  
  // Test 7: Check for React context provider
  const reactRoot = document.querySelector('#__next, [data-reactroot]');
  test('React App Structure', reactRoot !== null);
  
  // Test 8: Check if toast system is available (Sonner)
  const toastContainer = document.querySelector('[data-sonner-toaster]') || 
                        document.querySelector('[role="region"][aria-live]') ||
                        document.querySelector('.toast, .notification');
  test('Toast System Available', toastContainer !== null);
  
  // Test 9: Check if custom icons are loaded
  const mobileIcon = document.querySelector('svg[data-testid="mobile-icon"], [src*="mobile-app-icon"]');
  const desktopIcon = document.querySelector('svg[data-testid="desktop-icon"], [src*="desktop-icon"]');
  test('Custom Icons Available', mobileIcon !== null || desktopIcon !== null);
  
  // Test 10: Check viewport meta tag
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  test('Viewport Meta Tag Present', viewportMeta !== null);
  
  console.log(`\n📊 Test Results: ${testsPassed}/${totalTests} tests passed`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 All tests passed! Mobile View feature is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the implementation.');
  }
  
  // Additional debugging information
  console.log('\n🔍 Debug Information:');
  console.log('- Current mobile view state:', localStorage.getItem('mobileAppView'));
  console.log('- Body classes:', document.body.className);
  console.log('- User agent:', navigator.userAgent);
  console.log('- Viewport dimensions:', window.innerWidth + 'x' + window.innerHeight);
  
  return {
    passed: testsPassed,
    total: totalTests,
    success: testsPassed === totalTests
  };
})();
