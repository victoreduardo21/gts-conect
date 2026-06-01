const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const fullPath = path.join(dir, file);
            let stat;
            try {
                stat = fs.statSync(fullPath);
            } catch (e) {
                return;
            }
            if (stat && stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== 'proc' && file !== 'sys' && file !== 'dev') {
                    results = results.concat(walk(fullPath));
                }
            } else {
                if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
                    results.push(fullPath);
                }
            }
        });
    } catch (e) {
        // ignore
    }
    return results;
}

console.log('--- Searching container absolute paths ---');
const found = walk('/');
console.log('Found files count:', found.length);
console.log('Found files list:', found.slice(0, 100));
