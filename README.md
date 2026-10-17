# Study Glow: put it in the App Store

Needs: a Mac, Xcode (free), Node.js, and an Apple Developer account ($99/year).

## 1. Build the iOS app (in Terminal, inside this folder)
```
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/local-notifications @capacitor/haptics
npx cap init "Study Glow" com.yourname.studyglow --web-dir=www
mkdir www
cp index.html style.css app.js manifest.json sw.js *.png www/
npx cap add ios
npx cap sync
npx cap open ios
```
Change `com.yourname.studyglow` to your own unique ID (like com.maya.studyglow).

## 2. In Xcode
1. Click the App target, then Signing & Capabilities, and choose your Apple Developer team.
2. Open Assets, then AppIcon, and drag in `icon-1024.png`.
3. Plug in your iPhone and press Run to test.

## 3. Submit
1. Product, then Archive, then Distribute App, then App Store Connect.
2. In App Store Connect, add screenshots, description, privacy policy URL and age rating.
3. Test with TestFlight, then Submit for Review.

## After you change any code
Copy the files into `www` again, bump the version in `sw.js`, then run `npx cap sync`.

## Tips to pass review
- Self-host the Fredoka font (download it, add to the folder, use @font-face) so it works offline.
- Write a short privacy policy: "Study Glow stores everything on your device and collects no data."
- Mention the daily reminders and haptics in your review notes.
