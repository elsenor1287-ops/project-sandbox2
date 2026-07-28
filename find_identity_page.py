import re

with open('src/components/IdentityVerification.tsx', 'r') as f:
    content = f.read()

match = re.search(r'export function IdentityPage\(\{.*?\}\) \{', content, re.DOTALL)
if match:
    print(f"Found IdentityPage at index {match.start()}")
    print("Code snippet:")
    print(content[match.start():match.start()+200])
else:
    print("Could not find IdentityPage")
