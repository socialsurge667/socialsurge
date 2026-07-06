# SocialSurge — SMM Panel

## Ye kya hai?
Ek ready SMM Panel website — jisme ye sab ban chuka hai:
- User Signup/Login system
- User Dashboard (services list + order place karna)
- Wallet system (paise add karna)
- Admin Panel (services add karna, orders manage karna, users dekhna)
- Supplier API se judne ki jagah (jaha se aap resell ke liye services khareedte ho)

## Chalane ke steps (apne computer par)

1. **Node.js install karo** — https://nodejs.org se "LTS" version download karke install karo (bas Next-Next karke install ho jayega)

2. **Ye poora `socialsurge` folder** apne computer me kahin bhi copy karo

3. **Terminal/Command Prompt kholo** us folder ke andar:
   - Windows: folder khol kar upar address bar me `cmd` type karo aur Enter dabao
   - Ya folder par right-click karo → "Open in Terminal"

4. **Ye command chalao** (ek baar hi karna hai):
   ```
   npm install
   ```
   Isse zaroori packages download honge (internet chahiye)

5. **`.env.example` file ka naam badal kar `.env` karo**
   (Isme aapki settings hain — supplier API key, payment key, admin password)

6. **Server start karo:**
   ```
   npm start
   ```

7. **Browser me kholo:** `http://localhost:3000`

## Admin panel kaise kholein?
- `.env` file me diya email/password se `/login` par login karo
- Automatically admin panel (`/admin`) khul jayega
- Default: `admin@socialsurge.com` / `ChangeThisPassword123` (isse zaroor badal dena `.env` file me)

## Aage kya karna hai (Real business ke liye)

1. **Supplier Panel account lo** — jaise SMMKing, JustAnotherPanel (JAP), GrowFollows.
   Wahan se API key milegi, use `.env` file me `SUPPLIER_API_KEY` aur `SUPPLIER_API_URL` me daalo.

2. **Payment Gateway lagao** — abhi wallet me "Add Funds" test mode me hai (bina real payment ke balance add ho jata hai).
   Real paisa lene ke liye Razorpay (razorpay.com) par business account banao, aur `routes/payment.js`
   file me Razorpay Checkout integrate karna hoga (mujhe bolna, main wo bhi kar dunga).

3. **Domain + Hosting lo** — jaise Hostinger, aur Node.js support wali hosting chuno
   (Railway.app, Render.com bhi free/sasti options hain jo Node.js apps ke liye easy hain)

4. **Website ko live karo** — hosting par files upload karke `npm install` aur `npm start` chalao

## Zaroori Cheezein Yaad Rakhna
- Fake followers/likes bechna kaafi platforms (Instagram, YouTube) ke Terms of Service
  ke against hai — customers ke account restrict/ban ho sakte hain. Business risk samajh kar aage badhna.
- Payment gateway approval SMM panel jaise "high-risk" business ke liye mushkil ho sakta hai —
  Razorpay/PayU se pehle baat kar lena.
