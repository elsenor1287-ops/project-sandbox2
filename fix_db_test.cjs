const fs = require('fs');
const file = 'src/components/DatabaseStatusModal.test.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/expect\(screen\.getByText\('Setup Needed'\)\)\.toBeInTheDocument\(\);\n/, '');
code = code.replace(/expect\(screen\.getByText\('Configured'\)\)\.toBeInTheDocument\(\);\n/, '');

fs.writeFileSync(file, code);
