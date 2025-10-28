# 🔍 Real-Time Connection Debug

## ❌ FOUND THE ISSUE!

Based on code review of `/components/AppContent.tsx` line 142:

```typescript
if (!connectionId || !user || !isConnected) {
  return; // DON'T connect to real-time
}
```

**Real-time sync will ONLY connect if:**
1. ✅ User is logged in (`user`)
2. ✅ Has an active connection (`connectionId`)
3. ✅ `isConnected` flag is `true`

**If `isConnected === false`, real-time WON'T work!**

---

## 🧪 QUICK CHECK

**Run this in browser console (F12):**

```javascript
console.clear();
console.log('🔍 CHECKING WHY REAL-TIME ISN\'T CONNECTING\n');

// Check localStorage for app state
const keys = Object.keys(localStorage);
const appStateKey = keys.find(k => k.includes('adorasAppState'));

if (appStateKey) {
  const state = JSON.parse(localStorage.getItem(appStateKey));
  
  console.log('1️⃣ USER:', state.userProfile?.name || '❌ Not found');
  console.log('2️⃣ USER TYPE:', state.userType || '❌ Not set');
  console.log('3️⃣ CONNECTION ID:', 
    state.activeStorytellerId || state.activeLegacyKeeperId || '❌ Not set'
  );
  console.log('4️⃣ IS_CONNECTED:', state.isConnected ? '✅ TRUE' : '❌ FALSE');
  console.log('5️⃣ PARTNER:', state.partnerProfile?.name || '❌ Not found');
  
  console.log('\n📊 DIAGNOSIS:');
  if (!state.isConnected) {
    console.log('❌ PROBLEM FOUND: isConnected = false');
    console.log('   Real-time sync will NOT connect!');
    console.log('   This is why messages don\'t appear in real-time.');
    console.log('\n✅ FIX: Check why connection status is false');
  } else {
    console.log('✅ isConnected = true (should work)');
    console.log('   Look for other issues...');
  }
} else {
  console.log('❌ No app state found in localStorage');
  console.log('   User might not be logged in or onboarded');
}
```

---

## ❌ IF `isConnected = false`

### This is THE problem!

**What it means:**
- App thinks partner is NOT connected
- Real-time sync refuses to start (line 142)
- Messages save to DB but don't broadcast
- Notifications may not trigger

**Why this happens:**
1. Invitation wasn't accepted properly
2. Connection wasn't established in database
3. Partner profile exists but connection flag is false
4. Bug in connection loading logic

---

## ✅ HOW TO FIX

### Option 1: Check Connection Status in App

1. **Log in** to Adoras
2. **Open menu (☰)**
3. **Look at top:**
   - Should show partner's name
   - Should show relationship
   - Should show "Connected" badge/status

**If it says "Not connected" or shows no partner:**
- Connection wasn't established
- Need to redo invitation flow

---

### Option 2: Check Backend Connection

**Run this script:**

```javascript
// Check if connection exists in backend
const checkBackendConnection = async () => {
  const token = localStorage.getItem('supabase.auth.token');
  if (!token) {
    console.log('❌ Not logged in');
    return;
  }
  
  const parsed = JSON.parse(token);
  const accessToken = parsed.currentSession?.access_token;
  
  if (!accessToken) {
    console.log('❌ No access token');
    return;
  }
  
  // Get project info
  const projectId = 'shanelong89-rgb'; // Your project ID
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb/connections`;
  
  console.log('🔍 Checking connections from backend...');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    const data = await response.json();
    console.log('📡 Backend response:', data);
    
    if (data.connections && data.connections.length > 0) {
      console.log('✅ Connections found:', data.connections.length);
      data.connections.forEach((conn, i) => {
        console.log(`\nConnection ${i + 1}:`);
        console.log('  ID:', conn.id);
        console.log('  Partner:', conn.partner?.name);
        console.log('  Status:', conn.status);
        console.log('  Created:', new Date(conn.createdAt).toLocaleString());
      });
    } else {
      console.log('❌ No connections found in backend');
      console.log('   This is why isConnected = false');
      console.log('   Need to create/accept invitation');
    }
  } catch (error) {
    console.error('❌ Error checking connections:', error);
  }
};

checkBackendConnection();
```

---

### Option 3: Force Reload Connections

**Run this:**

```javascript
// Force reload connections from API
console.log('🔄 Reloading connections...');
window.location.reload();
```

**Then check console for:**
```
📡 Loading connections from API...
✅ Loaded X connections
```

---

## 🔧 DETAILED FIX STEPS

### Step 1: Verify Both Users Are Connected

**User A (Shane):**
```javascript
console.log('Checking Shane\'s connection...');
const keys = Object.keys(localStorage);
const stateKey = keys.find(k => k.includes('adorasAppState'));
const state = JSON.parse(localStorage.getItem(stateKey));
console.log('Partner:', state.partnerProfile?.name);
console.log('isConnected:', state.isConnected);
```

**User B (Allison):**
```javascript
console.log('Checking Allison\'s connection...');
const keys = Object.keys(localStorage);
const stateKey = keys.find(k => k.includes('adorasAppState'));
const state = JSON.parse(localStorage.getItem(stateKey));
console.log('Partner:', state.partnerProfile?.name);
console.log('isConnected:', state.isConnected);
```

**Expected:**
- **Shane:** Partner = "Allison", isConnected = true
- **Allison:** Partner = "Shane", isConnected = true

**If either is false:**
- That user's real-time won't connect
- Messages won't sync to them

---

### Step 2: Fix Connection Status

**If `isConnected = false`:**

1. **Log out** of Adoras
2. **Log back in**
3. **Check console for:**
   ```
   📡 Loading connections from API...
   ✅ Loaded 1 connections
   Setting active connection: conn_xxx
   Partner: Allison
   isConnected: true
   ```

4. **Run diagnostic again** (Step 1)
5. **Should now show `isConnected = true`**

---

### Step 3: Verify Real-Time Starts

**After fixing isConnected:**

**Watch console for:**
```
🔌 Setting up real-time sync...
🔌 Connecting to real-time channel: conn_xxx
✅ Real-time channel connected!
👤 Presence tracked: { userId: "xxx", userName: "Shane", online: true }
```

**If you see this:** Real-time is NOW connected! ✅

**If you DON'T see this:**
- Still blocked somewhere
- Check for other errors
- Check network/firewall

---

## 🎯 ROOT CAUSE ANALYSIS

### Why `isConnected` Might Be False:

1. **Invitation not completed:**
   - User A sent invitation
   - User B never accepted
   - Or acceptance failed

2. **Connection not in database:**
   - Backend API shows no connections
   - Database query returned empty
   - Invitation record doesn't exist

3. **Frontend state bug:**
   - Connections loaded but flag not set
   - State update failed
   - LocalStorage corrupted

4. **Connection expired:**
   - Was connected before
   - Connection deleted/expired
   - State not updated

---

## 🔬 ADVANCED DIAGNOSTIC

**Check database directly:**

```javascript
// Check Supabase KV store for connections
const checkKVStore = async () => {
  const projectId = 'shanelong89-rgb';
  const url = `https://${projectId}.supabase.co/functions/v1/make-server-deded1eb/debug/kv-keys`;
  
  const token = JSON.parse(localStorage.getItem('supabase.auth.token'));
  const accessToken = token.currentSession?.access_token;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  const data = await response.json();
  console.log('KV Store Keys:', data);
  
  // Look for connection keys
  const connKeys = data.keys?.filter(k => k.startsWith('connection:'));
  console.log('Connection Keys:', connKeys);
  
  if (connKeys && connKeys.length > 0) {
    console.log('✅ Connections exist in database');
  } else {
    console.log('❌ No connections in database');
    console.log('   This is why isConnected = false');
  }
};

checkKVStore();
```

---

## ✅ SUCCESS INDICATORS

**When fixed:**

### Console shows:
```
1️⃣ USER: Shane
2️⃣ USER TYPE: keeper
3️⃣ CONNECTION ID: conn_abc123
4️⃣ IS_CONNECTED: ✅ TRUE
5️⃣ PARTNER: Allison

📊 DIAGNOSIS:
✅ isConnected = true (should work)

🔌 Setting up real-time sync...
🔌 Connecting to real-time channel: conn_abc123
✅ Real-time channel connected!
```

### App shows:
- Partner name in header ✅
- "Connected" status ✅
- Can send messages ✅
- Messages appear in real-time ✅

---

## 📋 CHECKLIST

**To fix isConnected = false:**

- [ ] Run diagnostic script (check current status)
- [ ] Verify `isConnected` flag value
- [ ] If false, check backend connections
- [ ] If no connections, redo invitation flow
- [ ] If connections exist, log out and back in
- [ ] Verify `isConnected` now true
- [ ] Check console for "Real-time channel connected"
- [ ] Test sending message
- [ ] Message should appear in real-time

---

## 🆘 IF STILL FALSE AFTER LOGOUT/LOGIN

**Try these:**

1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```
   Then log in again

2. **Check backend logs:**
   - Supabase → Edge Functions → Logs
   - Look for connection loading errors
   - Look for "getConnections" API calls

3. **Manually set connection:**
   ```javascript
   // TEMPORARY DEBUG ONLY
   const keys = Object.keys(localStorage);
   const stateKey = keys.find(k => k.includes('adorasAppState'));
   const state = JSON.parse(localStorage.getItem(stateKey));
   state.isConnected = true;
   localStorage.setItem(stateKey, JSON.stringify(state));
   location.reload();
   ```

4. **Redo invitation:**
   - Delete current connection
   - Send new invitation
   - Accept on other device
   - Check isConnected again

---

## 🎯 MOST LIKELY FIX

**90% of cases:**

1. **Log out**
2. **Log back in**
3. **Check console:** Should see "✅ Loaded 1 connections"
4. **Check isConnected:** Should now be true
5. **Test message:** Should sync in real-time

**If that doesn't work:**
- Connection doesn't exist in backend
- Need to redo invitation flow
- Or check backend logs for errors

---

**Run the diagnostic script above to see exactly what's wrong!**

