with open('src/components/IdentityVerification.tsx', 'r') as f:
    content = f.read()

# Make sure VouchToken is imported
if 'type { IdentityState, VerificationStep } from \'../types\'' in content:
    content = content.replace(
        "type { IdentityState, VerificationStep } from '../types';",
        "type { IdentityState, VerificationStep, VouchToken } from '../types';"
    )
    content = content.replace("vouchTokens: any[]; // Use any or import VouchToken if possible", "vouchTokens: VouchToken[];")
    content = content.replace("vouchTokens.map((token: any) =>", "vouchTokens.map((token) =>")

with open('src/components/IdentityVerification.tsx', 'w') as f:
    f.write(content)
