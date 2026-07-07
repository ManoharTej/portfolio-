const fs = require('fs');
const data = fs.readFileSync('public/island.glb', 'utf8');
const matches = [...data.matchAll(/"name":"([^"]+)"/g)].map(m => m[1]);
console.log(Array.from(new Set(matches)).slice(0, 100));
