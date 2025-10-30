import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Detect iOS and standalone mode
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = ('standalone' in window.navigator && (window.navigator as any).standalone) || 
                     window.matchMedia('(display-mode: standalone)').matches;

console.log('🔍 PWA Environment:', { isIOS, isStandalone, userAgent: navigator.userAgent });

// Register Service Worker for PWA functionality
// iOS Safari in standalone mode requires special handling
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers are not supported in this browser');
    return;
  }

  try {
    console.log('🔄 Attempting service worker registration...');
    console.log('📍 Registration scope: /', 'SW path: /sw.js');
    
    // For iOS standalone, we need to register with explicit scope
    const registrationOptions: RegistrationOptions = {
      scope: '/',
      type: 'classic'
    };

    // iOS sometimes needs a small delay in standalone mode
    if (isIOS && isStandalone) {
      console.log('📱 iOS Standalone mode detected - using delayed registration');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const registration = await navigator.serviceWorker.register('/sw.js', registrationOptions);
    
    console.log('✅ Service Worker registered successfully!');
    console.log('   Scope:', registration.scope);
    console.log('   Active:', !!registration.active);
    console.log('   Installing:', !!registration.installing);
    console.log('   Waiting:', !!registration.waiting);

    // Wait for the service worker to become active
    if (registration.installing) {
      console.log('⏳ Service worker is installing...');
      await new Promise<void>((resolve) => {
        const worker = registration.installing;
        if (worker) {
          worker.addEventListener('statechange', () => {
            console.log('📊 Service worker state:', worker.state);
            if (worker.state === 'activated') {
              console.log('✅ Service worker activated!');
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    } else if (registration.waiting) {
      console.log('⏳ Service worker is waiting...');
    } else if (registration.active) {
      console.log('✅ Service worker already active!');
    }

    // Check for updates periodically (only in browser, not too aggressive on mobile)
    const updateInterval = isIOS ? 6 * 60 * 60 * 1000 : 60 * 60 * 1000; // 6 hours on iOS, 1 hour elsewhere
    setInterval(() => {
      console.log('🔄 Checking for service worker updates...');
      registration.update();
    }, updateInterval);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      console.log('🆕 Service worker update found!');
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('📊 New worker state:', newWorker.state);
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('✅ New service worker installed!');
            // On iOS, auto-update without prompt for better UX
            if (isIOS && isStandalone) {
              console.log('📱 Auto-updating for iOS standalone mode...');
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            } else {
              // Desktop/Android: Ask user
              if (confirm('A new version is available. Reload to update?')) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }
            }
          }
        });
      }
    });

    // Handle controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker controller changed');
      if (isIOS && isStandalone) {
        // On iOS standalone, reload after a brief delay to ensure smooth transition
        setTimeout(() => {
          console.log('🔄 Reloading app with new service worker...');
          window.location.reload();
        }, 100);
      } else {
        window.location.reload();
      }
    });

    // For iOS, verify registration worked
    if (isIOS) {
      setTimeout(async () => {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          console.log('✅ iOS: Service worker registration verified!');
          console.log('   Active:', !!reg.active);
          console.log('   Scope:', reg.scope);
        } else {
          console.error('❌ iOS: Service worker registration verification failed!');
        }
      }, 2000);
    }

  } catch (error) {
    console.error('❌ Service Worker registration failed!');
    console.error('   Error:', error);
    console.error('   Type:', error instanceof Error ? error.name : typeof error);
    console.error('   Message:', error instanceof Error ? error.message : String(error));
    
    // iOS-specific retry logic
    if (isIOS && isStandalone) {
      console.log('🔄 iOS: Retrying registration in 3 seconds...');
      setTimeout(() => {
        registerServiceWorker();
      }, 3000);
    }
  }
}

// Start service worker registration
// For iOS, register after a small delay to ensure page is fully loaded
if (isIOS && isStandalone) {
  // iOS standalone: Wait for full page load + small buffer
  if (document.readyState === 'complete') {
    setTimeout(registerServiceWorker, 100);
  } else {
    window.addEventListener('load', () => {
      setTimeout(registerServiceWorker, 100);
    });
  }
} else {
  // Other platforms: Register on load
  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
}

// Render React app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
