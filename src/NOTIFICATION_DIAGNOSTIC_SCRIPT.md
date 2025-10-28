# 🔍 Notification Diagnostic Script

## Run This in Browser Console (F12)

Copy and paste this entire script into your browser console to diagnose notification issues:

```javascript
// ============================================================================
// ADORAS NOTIFICATION DIAGNOSTIC SCRIPT
// ============================================================================

console.log('🔍 ADORAS NOTIFICATION DIAGNOSTIC');
console.log('================================\n');

(async () => {
  const results = {
    errors: [],
    warnings: [],
    passed: [],
  };

  // Test 1: Browser Support
  console.log('1️⃣ Checking browser support...');
  if ('Notification' in window) {
    results.passed.push('✅ Notifications API supported');
  } else {
    results.errors.push('❌ Notifications API NOT supported - Update browser!');
  }

  if ('serviceWorker' in navigator) {
    results.passed.push('✅ Service Worker API supported');
  } else {
    results.errors.push('❌ Service Worker NOT supported - Update browser!');
  }

  if ('PushManager' in window) {
    results.passed.push('✅ Push Manager API supported');
  } else {
    results.errors.push('❌ Push Manager NOT supported - Update browser!');
  }

  // Test 2: Notification Permission
  console.log('\n2️⃣ Checking notification permission...');
  const permission = Notification.permission;
  console.log('   Permission:', permission);
  
  if (permission === 'granted') {
    results.passed.push('✅ Notification permission: GRANTED');
  } else if (permission === 'denied') {
    results.errors.push('❌ Notification permission: DENIED - Enable in Settings!');
  } else {
    results.warnings.push('⚠️ Notification permission: NOT ASKED YET');
  }

  // Test 3: Service Worker Registration
  console.log('\n3️⃣ Checking service worker...');
  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration) {
      results.passed.push('✅ Service Worker: REGISTERED');
      console.log('   SW Scope:', registration.scope);
      console.log('   SW State:', registration.active?.state);
      
      if (registration.active) {
        results.passed.push('✅ Service Worker: ACTIVE');
      } else {
        results.warnings.push('⚠️ Service Worker: Not active yet');
      }
    }
  } catch (error) {
    results.errors.push('❌ Service Worker: NOT REGISTERED - Reinstall PWA!');
    console.error('   Error:', error);
  }

  // Test 4: Push Subscription
  console.log('\n4️⃣ Checking push subscription...');
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      results.passed.push('✅ Push Subscription: EXISTS');
      console.log('   Endpoint:', subscription.endpoint.substring(0, 50) + '...');
      console.log('   Keys:', subscription.toJSON().keys ? 'Present' : 'Missing');
    } else {
      results.errors.push('❌ Push Subscription: NONE - User not subscribed!');
      console.log('   💡 Solution: Menu → Notification Settings → Enable Notifications');
    }
  } catch (error) {
    results.errors.push('❌ Push Subscription check failed');
    console.error('   Error:', error);
  }

  // Test 5: VAPID Key Availability
  console.log('\n5️⃣ Checking VAPID keys...');
  try {
    const projectId = localStorage.getItem('supabase_project_id') || 'cyaaksjydpegofrldxbo';
    const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-deded1eb/notifications/vapid-public-key`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adoras_access_token') || sessionStorage.getItem('adoras_access_token') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'}`,
      },
    });
    
    const data = await response.json();
    
    if (response.ok && data.publicKey) {
      results.passed.push('✅ VAPID Public Key: AVAILABLE');
      console.log('   Key:', data.publicKey.substring(0, 20) + '...');
    } else if (data.needsSetup) {
      results.errors.push('❌ VAPID Keys: NOT CONFIGURED ON SERVER!');
      console.log('   💡 Solution: Add VAPID keys to Supabase Edge Functions');
      console.log('   📖 See: /VAPID_KEYS_FOR_SUPABASE.txt');
    } else {
      results.warnings.push('⚠️ VAPID Key check inconclusive');
      console.log('   Response:', data);
    }
  } catch (error) {
    results.warnings.push('⚠️ Could not check VAPID keys (may need login)');
    console.log('   Error:', error.message);
  }

  // Test 6: Badge API (iOS)
  console.log('\n6️⃣ Checking Badge API (iOS)...');
  if ('setAppBadge' in navigator) {
    results.passed.push('✅ Badge API: SUPPORTED');
    try {
      await navigator.setAppBadge(1);
      await navigator.clearAppBadge();
      results.passed.push('✅ Badge API: WORKING');
    } catch (error) {
      results.warnings.push('⚠️ Badge API supported but failed - Check iOS Settings');
    }
  } else {
    results.warnings.push('⚠️ Badge API: NOT SUPPORTED (not iOS PWA or old iOS version)');
  }

  // Test 7: PWA Detection
  console.log('\n7️⃣ Checking PWA installation...');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                       window.navigator.standalone ||
                       document.referrer.includes('android-app://');
  
  if (isStandalone) {
    results.passed.push('✅ PWA: INSTALLED (running standalone)');
  } else {
    results.warnings.push('⚠️ PWA: NOT INSTALLED (running in browser)');
    console.log('   💡 iOS: Safari → Share → Add to Home Screen');
    console.log('   💡 Android: Chrome will prompt to install');
  }

  // Test 8: Local Storage Check
  console.log('\n8️⃣ Checking local storage...');
  const hasToken = !!(localStorage.getItem('adoras_access_token') || sessionStorage.getItem('adoras_access_token'));
  const hasSeenPrompt = !!localStorage.getItem('adoras_notification_prompt_shown');
  
  if (hasToken) {
    results.passed.push('✅ User: LOGGED IN');
  } else {
    results.warnings.push('⚠️ User: NOT LOGGED IN');
  }
  
  console.log('   Seen notification prompt:', hasSeenPrompt);
  console.log('   Access token:', hasToken ? 'Present' : 'Missing');

  // ========================================================================
  // FINAL REPORT
  // ========================================================================
  
  console.log('\n');
  console.log('================================');
  console.log('📊 DIAGNOSTIC REPORT');
  console.log('================================\n');
  
  if (results.passed.length > 0) {
    console.log('✅ PASSED:');
    results.passed.forEach(msg => console.log('   ' + msg));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.warnings.forEach(msg => console.log('   ' + msg));
  }
  
  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS (MUST FIX):');
    results.errors.forEach(msg => console.log('   ' + msg));
  }
  
  // ========================================================================
  // RECOMMENDATIONS
  // ========================================================================
  
  console.log('\n================================');
  console.log('💡 RECOMMENDATIONS');
  console.log('================================\n');
  
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log('🎉 ALL SYSTEMS GO! Notifications should work!');
    console.log('\n📱 Test it:');
    console.log('   1. Menu → Notification Settings');
    console.log('   2. Click "Send Test Notification"');
    console.log('   3. Should see notification in 2-5 seconds');
  } else {
    console.log('🔧 TO FIX NOTIFICATIONS:\n');
    
    // Priority 1: VAPID Keys
    if (results.errors.some(e => e.includes('VAPID'))) {
      console.log('1️⃣ ADD VAPID KEYS (CRITICAL!)');
      console.log('   → Supabase Dashboard → Edge Functions → Secrets');
      console.log('   → Add keys from /VAPID_KEYS_FOR_SUPABASE.txt');
      console.log('   → Wait 2 minutes\n');
    }
    
    // Priority 2: Permission
    if (results.errors.some(e => e.includes('DENIED'))) {
      console.log('2️⃣ ENABLE PERMISSIONS');
      console.log('   iOS: Settings → Adoras → Notifications → ON');
      console.log('   Android: Settings → Apps → Adoras → Notifications → ON\n');
    }
    
    // Priority 3: Subscription
    if (results.errors.some(e => e.includes('Subscription'))) {
      console.log('3️⃣ SUBSCRIBE TO NOTIFICATIONS');
      console.log('   → Menu → Notification Settings');
      console.log('   → Click "Enable Notifications"');
      console.log('   → Allow when prompted\n');
    }
    
    // Priority 4: PWA Installation (iOS)
    if (results.warnings.some(w => w.includes('PWA')) && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      console.log('4️⃣ INSTALL AS PWA (iOS REQUIRED!)');
      console.log('   → Safari → Share → Add to Home Screen');
      console.log('   → Open from home screen icon (NOT Safari)');
      console.log('   → Log in again\n');
    }
    
    // Priority 5: Service Worker
    if (results.errors.some(e => e.includes('Service Worker'))) {
      console.log('5️⃣ REINSTALL APP');
      console.log('   → Delete app from home screen');
      console.log('   → Reinstall via Add to Home Screen');
      console.log('   → Open from home screen icon\n');
    }
  }
  
  console.log('================================');
  console.log('📖 Full Guide: /MOBILE_NOTIFICATION_TROUBLESHOOTING.md');
  console.log('================================\n');
})();
```

## 📋 How to Use

1. **Open your app** (Adoras)
2. **Press F12** to open developer console
   - Desktop: F12 key
   - iOS Safari: Settings → Safari → Advanced → Web Inspector
   - Chrome Mobile: chrome://inspect
3. **Click "Console" tab**
4. **Copy the entire script above**
5. **Paste into console**
6. **Press Enter**
7. **Read the report!**

## 📊 What It Checks

1. ✅ Browser support for notifications
2. ✅ Notification permissions
3. ✅ Service worker registration
4. ✅ Push subscription status
5. ✅ VAPID keys availability
6. ✅ Badge API (iOS)
7. ✅ PWA installation
8. ✅ User login status

## 📖 Reading the Results

### ✅ PASSED
- All good! These features are working.

### ⚠️ WARNINGS
- Not critical, but may affect functionality
- Recommended to fix for best experience

### ❌ ERRORS (MUST FIX)
- Critical issues preventing notifications
- Must be fixed for notifications to work

## 🎯 Common Results

### Result: "VAPID Keys: NOT CONFIGURED"

**Fix:**
1. Go to Supabase Dashboard
2. Edge Functions → Secrets
3. Add 3 keys from `/VAPID_KEYS_FOR_SUPABASE.txt`
4. Wait 2 minutes
5. Run script again

---

### Result: "Permission: DENIED"

**Fix:**
- iOS: Settings → Adoras → Notifications → ON
- Desktop: Browser settings → Site permissions → Allow

---

### Result: "Push Subscription: NONE"

**Fix:**
1. Menu → Notification Settings
2. Click "Enable Notifications"
3. Allow when prompted
4. Run script again

---

### Result: "PWA: NOT INSTALLED"

**Fix (iOS):**
1. Safari → Share → Add to Home Screen
2. Open from home screen (not Safari!)
3. Log in
4. Run script again

---

## 🎉 Success Output

When everything works, you should see:

```
================================
📊 DIAGNOSTIC REPORT
================================

✅ PASSED:
   ✅ Notifications API supported
   ✅ Service Worker API supported
   ✅ Push Manager API supported
   ✅ Notification permission: GRANTED
   ✅ Service Worker: REGISTERED
   ✅ Service Worker: ACTIVE
   ✅ Push Subscription: EXISTS
   ✅ VAPID Public Key: AVAILABLE
   ✅ Badge API: SUPPORTED
   ✅ Badge API: WORKING
   ✅ PWA: INSTALLED (running standalone)
   ✅ User: LOGGED IN

================================
💡 RECOMMENDATIONS
================================

🎉 ALL SYSTEMS GO! Notifications should work!

📱 Test it:
   1. Menu → Notification Settings
   2. Click "Send Test Notification"
   3. Should see notification in 2-5 seconds
```

---

**Run this script first to diagnose what's wrong!** 🔍

