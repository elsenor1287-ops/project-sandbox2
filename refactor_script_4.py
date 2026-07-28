with open('src/components/IdentityVerification.tsx', 'r') as f:
    content = f.read()

import re

# We need to extract the IdentityPage function body and replace it with the new one
match = re.search(r'(export function IdentityPage\(\{.*?\}\: IdentityPageProps\) \{)(.*)', content, re.DOTALL)
if not match:
    print("Could not find IdentityPage definition")
    exit(1)

func_start = match.group(1)
rest = match.group(2)

new_rest = """
  const [isScanning, setIsScanning] = React.useState(false);
  const [isVouched, setIsVouched] = React.useState(false);
  const [isVouchingInProgress, setIsVouchingInProgress] = React.useState(false);

  const handleVerifyNeighbor = async () => {
    setIsVouchingInProgress(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsVouched(true);
    setIsVouchingInProgress(false);
  };

  const handleScan = async () => {
    setIsScanning(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsScanning(false);
    onCompleteStep('passport');
  };

  const verificationSteps = [
    {
      id: 'passport',
      label: 'Passport Biometric',
      icon: Scan,
      isComplete: identity.passportVerified,
      isCurrent: identity.verificationStep === 'passport',
    },
    {
      id: 'utility',
      label: 'Utility Bill Credential',
      icon: FileText,
      isComplete: identity.utilityVerified,
      isCurrent: identity.verificationStep === 'utility',
    },
    {
      id: 'vouching',
      label: 'Peer Vouching (3 Neighbors)',
      icon: Users,
      isComplete: identity.status === 'active',
      isCurrent: identity.verificationStep === 'vouching',
    },
  ];

  return (
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
    </div>
  );
}
"""

new_content = content[:match.start()] + func_start + new_rest

with open('src/components/IdentityVerification.tsx', 'w') as f:
    f.write(new_content)
