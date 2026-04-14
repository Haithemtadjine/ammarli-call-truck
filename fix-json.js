const fs = require('fs');
const path = require('path');

function dedupeJson(filePath) {
    const fullPath = path.resolve(__dirname, filePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // JSON.parse automatically overwrites duplicate keys (keeps the last one)
        const parsed = JSON.parse(content);
        fs.writeFileSync(fullPath, JSON.stringify(parsed, null, 2), 'utf8');
        console.log(`Deduplicated: ${filePath}`);
    } catch (e) {
        console.error(`Error processing ${filePath}:`, e);
    }
}

dedupeJson('src/localization/en.json');
dedupeJson('src/localization/ar.json');
