const fs = require('fs');
const path = require('path');

function checkPath(p) {
    console.log(`Checking path: ${p}`);
    try {
        if (fs.existsSync(p)) {
            console.log(`Exists!`);
            const stat = fs.statSync(p);
            if (stat.isDirectory()) {
                console.log(`It is a directory. Contents:`, fs.readdirSync(p));
            } else {
                console.log(`It is a file. Size:`, stat.size);
            }
            return true;
        } else {
            console.log(`Does not exist.`);
            return false;
        }
    } catch (e) {
        console.log(`Error checking path:`, e.message);
        return false;
    }
}

checkPath('/.gemini');
checkPath('/.gemini/antigravity');
checkPath('/.gemini/antigravity/brain');
checkPath('/.gemini/antigravity/brain/669a1af9-89cc-4885-9a82-3a9ac9fa1c62');
checkPath('/.gemini/antigravity/brain/669a1af9-89cc-4885-9a82-3a9ac9fa1c62/.system_generated');
checkPath('/.gemini/antigravity/brain/669a1af9-89cc-4885-9a82-3a9ac9fa1c62/.system_generated/logs');
checkPath('/.gemini/antigravity/brain/669a1af9-89cc-4885-9a82-3a9ac9fa1c62/.system_generated/logs/transcript.jsonl');
