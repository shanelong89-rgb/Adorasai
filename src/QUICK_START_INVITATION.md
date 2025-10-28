# Quick Start: Setup FAM-2024-XY9K Invitation

## 🚀 Quick Steps

### 1. Open Debug Panel
Press **Ctrl+Shift+D** (Windows/Linux) or **Cmd+Shift+D** (Mac)

### 2. Go to Test Tab
Click the **"Test"** tab in the Debug Panel

### 3. Setup Invitation
Click **"Setup Invitation"** button

This will:
- ✅ Find Shane Long's account (shanelong@gmail.com)
- ✅ Create invitation code **FAM-2024-XY9K**
- ✅ Link it to Shane as the Keeper
- ✅ Set Allison Tam as expected Teller

### 4. Verify Setup
You'll see:
```
Setup Successful ✅
Keeper: Shane Long (keeper)
Email: shanelong@gmail.com
Invitation: FAM-2024-XY9K
Status: sent
Expected Teller: Allison Tam
```

### 5. Test Allison's Signup
1. Sign out (if logged in)
2. Click "Sign Up"
3. Choose "Storyteller" (Teller)
4. Enter Allison's details:
   - Name: Allison Tam
   - Email: allison.tam@hotmail.com
   - Password: (any password)
5. Enter invitation code: **FAM-2024-XY9K**
6. Complete signup

### 6. Check Connection
1. Press **Ctrl+Shift+D** to open Debug Panel
2. Go to **"Test"** tab
3. Click **"Check Connection"**

You should see:
```
Connection Status ✅
Shane Long (keeper) - shanelong@gmail.com
Allison Tam (teller) - allison.tam@hotmail.com
Connected ✅
Invitation Code: FAM-2024-XY9K
Status: active
```

## 🔧 Troubleshooting

### Shane Long Not Found?
Make sure Shane is signed up first:
- Email: shanelong@gmail.com
- User Type: Legacy Keeper
- Name: Shane Long

### Can't Open Debug Panel?
The debug panel is enabled automatically. Just press **Ctrl+Shift+D** or **Cmd+Shift+D**.

If it still doesn't work, open browser console and run:
```javascript
localStorage.setItem('adoras-debug', 'true');
```
Then refresh the page.

### Invitation Code Not Working?
Run the setup again:
1. Open Debug Panel (Ctrl+Shift+D)
2. Test tab
3. Click "Setup Invitation"

## 📱 What Happens Next?

After the connection is established:
1. Shane (Keeper) can see Allison in his connections
2. Allison (Teller) can see Shane in her connections  
3. They can start sharing memories through:
   - Daily prompts
   - Chat messages
   - Photo/video uploads
   - Voice notes
4. Shane has admin privileges (can edit/delete memories)
5. Allison has simplified experience (view/add memories)

## 🎯 Expected Database State

After successful setup:
```
invitation:FAM-2024-XY9K -> {
  code: "FAM-2024-XY9K",
  keeperId: "<Shane's ID>",
  status: "accepted",
  tellerName: "Allison Tam"
}

connection:<connection-id> -> {
  keeperId: "<Shane's ID>",
  tellerId: "<Allison's ID>",
  status: "active",
  invitationCode: "FAM-2024-XY9K"
}

user_connections:<Shane's ID> -> ["<connection-id>"]
user_connections:<Allison's ID> -> ["<connection-id>"]
```

## ✨ Tips

- The invitation expires in 90 days (adjustable in setup script)
- You can run the setup multiple times (it will show existing invitation)
- Use "Check Connection" to verify the relationship at any time
- All test data is stored in the KV database
