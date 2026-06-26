# Mobile Testing Guide

This guide explains how any team member can configure and test the EcoSankalan application on their mobile phone while running the code on their own PC.

## Why Configuration is Needed
By default, the React frontend and Node.js backend communicate via `localhost`. While `localhost` works perfectly on your PC, attempting to access `localhost` on a mobile phone's browser will look for a server on the *phone itself*. 

To fix this, we must configure both the frontend and backend to communicate over your local Wi-Fi router's IP address instead.

---

## Step 1: Find Your PC's Local IP Address
You need to find the internal IPv4 address assigned to your PC by your Wi-Fi router.

* **Windows:** Open Command Prompt or PowerShell and run `ipconfig`. Look for the "IPv4 Address" under your active Wi-Fi adapter (e.g., `192.168.1.15` or `10.146.x.x`).
* **Mac/Linux:** Open Terminal and run `ifconfig` or `ipconfig getifaddr en0`.

*(Note: We will use `192.168.1.15` as an example IP address for the rest of this guide. Replace it with your actual IP).*

---

## Step 2: Configure the Backend (.env)
The backend uses CORS (Cross-Origin Resource Sharing) to block unknown devices from accessing the API. We need to add your phone's future URL to the safe list.

1. Open the `.env` file located in the root of the **backend** folder.
2. Find the `ALLOWED_ORIGINS` variable.
3. Add your PC's IP address with port `5173` to the comma-separated list.

**Example:**
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://192.168.1.15:5173
```

---

## Step 3: Configure the Frontend (.env)
The frontend needs to know where to send its API requests (like the AI Image Scan). We need to hardcode the backend's network location.

1. Navigate into the **`frontend/`** directory.
2. If a `.env` file does not exist here, create one.
3. Add the `VITE_API_URL` variable pointing to your PC's IP address on port `5000`.

**Example:**
```env
VITE_API_URL=http://192.168.1.15:5000
```

---

## Step 4: Run the Servers
Now that both sides know how to communicate over the network, start them up.

1. **Start Backend:** In your backend terminal, run:
   ```bash
   npm run dev
   ```
   *(Ensure it successfully connects to MongoDB).*

2. **Start Frontend (Host Mode):** In your frontend terminal, you MUST include the `--host` flag. This tells Vite to expose the server to your Wi-Fi router.
   ```bash
   npm run dev -- --host
   ```

---

## Step 5: Test on Your Phone
1. Connect your mobile phone to the **exact same Wi-Fi network** as your PC.
2. Open your mobile browser (Chrome/Safari).
3. Type in the **Network URL** provided by the Vite terminal.

**Example URL to type on phone:**
```text
http://192.168.1.15:5173
```

You should now see the EcoSankalan app on your phone. You can use native features like the camera for the AI Scan feature, and all requests will be securely routed back to your PC's backend!
