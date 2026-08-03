const fs = require('fs');
const file = 'src/components/DatabaseStatusModal.tsx';
let code = fs.readFileSync(file, 'utf8');

// There is a stray function SetupScriptPanel() { ... injected directly into JSX, replace it
code = code.replace(/function SetupScriptPanel\(\) \{\n  const \[copied, setCopied\] = useState\(false\);\n\n/, `        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Status Panel */}
          <div className="space-y-4">\n`);

fs.writeFileSync(file, code);
