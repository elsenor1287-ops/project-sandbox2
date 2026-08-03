const fs = require('fs');
const file = 'src/hooks/useAppState.ts';
let code = fs.readFileSync(file, 'utf8');

const regex = /const SEED_PROPOSALS: Proposal\[\] = \[\s*\{[\s\S]*?\}\s*\];\n/m;
code = code.replace(regex, '');

fs.writeFileSync(file, code);
