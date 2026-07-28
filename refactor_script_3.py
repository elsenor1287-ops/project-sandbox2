with open('src/components/IdentityVerification.tsx', 'r') as f:
    content = f.read()

# I need to find the IdentityPage return statement and replace it
import re

# Find the IdentityPage function body
identity_page_match = re.search(r'(export function IdentityPage\(\{.*?\}\) \{)(.*?)(  return \()', content, re.DOTALL)
if not identity_page_match:
    print("Could not find IdentityPage definition")
    exit(1)

func_start = identity_page_match.group(1)
func_body = identity_page_match.group(2)

# Remove the parts we moved to components from func_body
func_body = re.sub(r'  const getStatusIcon = \(\) => \{.*?  \};\n\n', '', func_body, flags=re.DOTALL)
func_body = re.sub(r'  const getStatusBadge = \(\) => \{.*?  \};\n\n', '', func_body, flags=re.DOTALL)

# Keep the state and other handlers
# Now replace the return statement block
old_return_block_match = re.search(r'(  return \()(.*?)(\n  \);\n\})', content, re.DOTALL)

if not old_return_block_match:
    print("Could not find return block")
    exit(1)

new_return_block = """  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Identity Wallet</h1>
          <p className="text-primary-400 mt-1">Self-sovereign credential verification</p>
        </div>
      </div>

      <ActiveVouchRequests
        isVouched={isVouched}
        isVouchingInProgress={isVouchingInProgress}
        onVerifyNeighbor={handleVerifyNeighbor}
      />

      <StatusCard identity={identity} />

      <VerificationPipeline
        identity={identity}
        isScanning={isScanning}
        onScan={handleScan}
        verificationSteps={verificationSteps}
      />

      <VouchTokensList vouchTokens={identity.vouchTokens} />
    </div>"""

# Replace the whole function body and return block
# I can just use string replace for the whole IdentityPage function since it's the last thing in the file

new_identity_page = f"""{func_start}{func_body}{new_return_block}
  );
}}
"""

new_content = content[:identity_page_match.start()] + new_identity_page

with open('src/components/IdentityVerification.tsx', 'w') as f:
    f.write(new_content)
