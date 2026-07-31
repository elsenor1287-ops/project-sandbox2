const fs = require('fs');
const file = 'src/components/ProposalCompiler.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Move getTierInfo and highlightViolations
const getTierInfoRegex = /  const getTierInfo = \([\s\S]*?    \}\n  \};\n\n/;
const highlightViolationsRegex = /  const highlightViolations = \([\s\S]*?    \}\);\n  \};\n\n/;

const getTierInfoMatch = code.match(getTierInfoRegex);
const highlightViolationsMatch = code.match(highlightViolationsRegex);

code = code.replace(getTierInfoRegex, '');
code = code.replace(highlightViolationsRegex, '');

const getTierInfoFunction = `export const getTierInfo = ` + getTierInfoMatch[0].trim().replace(/^const getTierInfo = /, '') + '\n\n';
const highlightViolationsFunction = `export const highlightViolations = ` + highlightViolationsMatch[0].trim().replace(/^const highlightViolations = /, '') + '\n\n';


// 2. Update CompilerOutput
const oldProps = `interface CompilerOutputProps {
  compileResult: {
    success: boolean;
    violations: string[];
    proposal?: Proposal;
  } | null;
  content: string;
  getTierInfo: (tier: string) => { label: string; icon: React.ElementType; color: string; desc: string };
  highlightViolations: (text: string, violations: string[]) => string;
}`;
const newProps = `interface CompilerOutputProps {
  compileResult: {
    success: boolean;
    violations: string[];
    proposal?: Proposal;
  } | null;
  content: string;
}`;
code = code.replace(oldProps, newProps);

const oldSig = `function CompilerOutput({ compileResult, content, getTierInfo, highlightViolations }: CompilerOutputProps) {`;
const newSig = `function CompilerOutput({ compileResult, content }: CompilerOutputProps) {`;
code = code.replace(oldSig, newSig);

code = code.replace(`interface CompilerOutputProps {`, `${getTierInfoFunction}${highlightViolationsFunction}interface CompilerOutputProps {`);

const oldUsage = `<CompilerOutput compileResult={compileResult} content={content} getTierInfo={getTierInfo} highlightViolations={highlightViolations} />`;
const newUsage = `<CompilerOutput compileResult={compileResult} content={content} />`;
code = code.replace(oldUsage, newUsage);


// 3. Extract ProposalEditor
const logicRegex = /  const textareaRef = useRef<HTMLTextAreaElement>\(null\);\n  const backdropRef = useRef<HTMLDivElement>\(null\);\n\n  const segments = useMemo\(\(\) => parseContent\(content\), \[content\]\);\n  const hasValidationError = useMemo\(\(\) => segments\.some\(seg => seg\.isViolation\), \[segments\]\);\n\n  const handleScroll = \(\) => \{\n    if \(textareaRef\.current && backdropRef\.current\) \{\n      backdropRef\.current\.scrollTop = textareaRef\.current\.scrollTop;\n    \}\n  \};\n\n  useEffect\(\(\) => \{\n    if \(textareaRef\.current && backdropRef\.current\) \{\n      backdropRef\.current\.scrollTop = textareaRef\.current\.scrollTop;\n    \}\n  \}, \[content\]\);\n\n  const handleSpanMouseDown = \(e: React\.MouseEvent\) => \{\n    e\.preventDefault\(\);\n    const textarea = textareaRef\.current;\n    if \(!textarea\) return;\n\n    textarea\.focus\(\);\n\n    const backdrop = backdropRef\.current;\n    if \(backdrop\) \{\n      backdrop\.style\.pointerEvents = 'none';\n      const el = document\.elementFromPoint\(e\.clientX, e\.clientY\);\n      if \(el\) \{\n        const clickEvent = new MouseEvent\('mousedown', \{\n          clientX: e\.clientX,\n          clientY: e\.clientY,\n          bubbles: true,\n          cancelable: true,\n        \}\);\n        el\.dispatchEvent\(clickEvent\);\n      \}\n      backdrop\.style\.pointerEvents = 'auto';\n    \}\n  \};\n\n/;

const logicMatch = code.match(logicRegex);
code = code.replace(logicRegex, '');

const startIndex = code.indexOf('        {/* Editor */}');
const endIndex = code.indexOf('        {/* Output */}');

const toReplace = code.substring(startIndex, endIndex);

code = code.replace(toReplace, `        {/* Editor */}
        <ProposalEditor
          title={title}
          setTitle={setTitle}
          content={content}
          setContent={setContent}
          selectedTier={selectedTier}
          setSelectedTier={setSelectedTier}
          isCompiling={isCompiling}
          onCompile={handleCompile}
        />\n\n`);

const componentDef = `interface ProposalEditorProps {
  title: string;
  setTitle: (title: string) => void;
  content: string;
  setContent: (content: string) => void;
  selectedTier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic';
  setSelectedTier: (tier: 'law1_shield' | 'law2_sandbox' | 'law3_dynamic') => void;
  isCompiling: boolean;
  onCompile: () => void;
}

export function ProposalEditor({
  title,
  setTitle,
  content,
  setContent,
  selectedTier,
  setSelectedTier,
  isCompiling,
  onCompile,
}: ProposalEditorProps) {
${logicMatch[0]}
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-primary-200 mb-4 flex items-center gap-2">
        <Code2 className="w-5 h-5" />
        Proposal Editor
      </h2>

      <div className="space-y-4">
        <div>
          <label className="label">Proposal Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="input"
            placeholder="Enter proposal title..."
          />
        </div>

        <div>
          <label className="label">Governance Tier</label>
          <div className="grid grid-cols-3 gap-2">
            {(['law1_shield', 'law2_sandbox', 'law3_dynamic'] as const).map(tier => {
              const info = getTierInfo(tier);
              return (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  className={\`p-3 rounded-lg border text-left transition-all \${
                    selectedTier === tier
                      ? tier === 'law1_shield'
                        ? 'bg-danger-500/20 border-danger-500/50'
                        : tier === 'law2_sandbox'
                        ? 'bg-success-500/20 border-success-500/50'
                        : 'bg-accent-500/20 border-accent-500/50'
                      : 'bg-primary-800/50 border-primary-700/50 hover:border-primary-500'
                  }\`}
                >
                  <info.icon
                    className={\`w-5 h-5 mb-1 \${
                      tier === 'law1_shield'
                        ? 'text-danger-400'
                        : tier === 'law2_sandbox'
                        ? 'text-success-400'
                        : 'text-accent-400'
                    }\`}
                  />
                  <p className="text-sm font-medium text-primary-200">{info.label.split(': ')[0]}</p>
                </button>
              );
            })}
          </div>
          {selectedTier === 'law1_shield' && (
            <p className="text-xs text-danger-400 mt-2 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Shield tier proposals are automatically vetoed
            </p>
          )}
        </div>

        <div>
          <label className="label">Proposal Content</label>
          <div className="relative w-full h-[200px] bg-primary-900/50 border border-primary-700 rounded-lg focus-within:ring-2 focus-within:ring-accent-500 focus-within:border-transparent transition-all overflow-hidden">
            {/* Backdrop with highlighted violations */}
            <div
              ref={backdropRef}
              className="absolute inset-0 w-full h-full px-4 py-3 font-mono text-sm leading-6 whitespace-pre-wrap break-words overflow-y-auto select-none pointer-events-none z-20"
            >
              {segments.map((segment, index) => {
                if (segment.isViolation) {
                  return (
                    <span
                      key={index}
                      className="relative group/tooltip inline underline decoration-wavy decoration-danger-500 underline-offset-4 text-danger-400 font-semibold cursor-help pointer-events-auto"
                      onMouseDown={handleSpanMouseDown}
                    >
                      {segment.text}
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-primary-950 text-primary-100 text-xs px-3 py-2 rounded-lg border border-danger-500/30 shadow-xl whitespace-normal w-64 z-50 pointer-events-none text-center font-sans font-normal">
                        Law 1 Compiler Warning: This clause violates an inalienable right. Please modify to proceed.
                        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary-950" />
                      </span>
                    </span>
                  );
                }
                return (
                  <span key={index} className="text-primary-200">
                    {segment.text}
                  </span>
                );
              })}
              {!content && (
                <span className="text-primary-500 pointer-events-none font-sans">
                  Enter your proposal content here...
                  <br /><br />
                  Tip: Try adding words like 'ban speech' or 'seize property' to test Law 1 shield violations.
                </span>
              )}
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              onScroll={handleScroll}
              className="absolute inset-0 w-full h-full px-4 py-3 bg-transparent text-transparent caret-primary-100 font-mono text-sm leading-6 resize-none focus:outline-none z-10 overflow-y-auto"
            />
          </div>
        </div>

        <button
          onClick={onCompile}
          disabled={!title || !content || isCompiling || hasValidationError}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompiling ? (
            <>
              <span className="animate-spin">⏳</span>
              Compiling Proposal...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Compile & Submit
            </>
          )}
        </button>
      </div>
    </div>
  );
}
`;


code = code.replace(/export function CompilerPage\(\{/, `${componentDef}\nexport function CompilerPage({`);

fs.writeFileSync(file, code);
