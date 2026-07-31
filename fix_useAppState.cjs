const fs = require('fs');
const file = 'src/hooks/useAppState.ts';
let code = fs.readFileSync(file, 'utf8');

// Replace unused import
code = code.replace(/import \{ \w*SEED_PROPOSALS\w* \,?.*?\} from '\.\.\/data\/mockData';/g, (match) => {
    return match.replace(/SEED_PROPOSALS\s*,?\s*/, '');
});
if (code.includes('import {  }')) {
    code = code.replace(/import \{  \} from '\.\.\/data\/mockData';\n/g, '');
} else {
    // If it's the only import, maybe it just needs to be removed
    code = code.replace(/import \{ SEED_PROPOSALS \} from '\.\.\/data\/mockData';\n/g, '');
}


// Check if it's imported in a specific way
if (code.includes('import { SEED_PROPOSALS')) {
    code = code.replace('import { SEED_PROPOSALS,', 'import {');
    code = code.replace('import { SEED_PROPOSALS }', 'import {}');
    code = code.replace('import {} from \'../data/mockData\';\n', '');
}

// Or maybe it's just defined in the file
const regex = /const SEED_PROPOSALS = \[[\s\S]*?\];\n\n/;
code = code.replace(regex, '');
code = code.replace(/const SEED_PROPOSALS = \[.*?\];/s, '');
fs.writeFileSync(file, code);
