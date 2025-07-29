const fs = require('fs');

// Read the file
const content = fs.readFileSync('src/app/actions.ts', 'utf8');

// Remove emoji characters
const cleanContent = content
  .replace(/🔥/g, '')
  .replace(/🚀/g, '')
  .replace(/📅/g, '')
  .replace(/💡/g, '')
  .replace(/⚠️/g, '')
  .replace(/✅/g, '')
  .replace(/❌/g, '')
  .replace(/🎯/g, '')
  .replace(/📊/g, '')
  .replace(/🔍/g, '');

// Write the cleaned content back
fs.writeFileSync('src/app/actions.ts', cleanContent, 'utf8');

console.log('Emojis removed successfully!');