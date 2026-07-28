import re

with open('src/components/IdentityVerification.tsx', 'r') as f:
    content = f.read()

# Replace the long function with subcomponents
new_content = content.replace("""export function IdentityPage({
  identity,
  onCompleteStep,
}: IdentityPageProps) {""", """
// Subcomponents

interface ActiveVouchRequestsProps {
  isVouched: boolean;
  isVouchingInProgress: boolean;
  onVerifyNeighbor: () => void;
}

function ActiveVouchRequests({ isVouched, isVouchingInProgress, onVerifyNeighbor }: ActiveVouchRequestsProps) {
  return (
    <div className="card p-6 bg-primary-900/40 border border-primary-800 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-accent-950/50 border border-accent-800 rounded-lg text-accent-400 mt-0.5">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
              Active Vouch Requests
              {!isVouched && (
                <span className="badge-warning bg-warning-500/10 text-warning-400 border-warning-500/20 text-[10px] px-2 py-0.5">
                  1 Pending
                </span>
              )}
            </h2>
            <p className="text-primary-300 text-sm mt-1">
              New resident in Hillsborough County is requesting a neighbor vouch.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isVouched ? (
            <span className="badge-success bg-success-500/10 text-success-400 border border-success-500/20 py-2 px-4 rounded-lg flex items-center gap-1.5 text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              Vouch Verified
            </span>
          ) : (
            <button
              onClick={onVerifyNeighbor}
              disabled={isVouchingInProgress}
              className="btn btn-primary bg-accent-600 hover:bg-accent-500 text-white border-none shadow-lg shadow-accent-600/20 hover:shadow-accent-500/30 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            >
              {isVouchingInProgress ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Signing Vouch...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Verify Neighbor
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface StatusCardProps {
  identity: IdentityState;
}

function StatusCard({ identity }: StatusCardProps) {
  const getStatusIcon = () => {
    switch (identity.status) {
      case 'active':
        return <Shield className="w-8 h-8 text-success-400" />;
      case 'frozen':
        return <ShieldAlert className="w-8 h-8 text-danger-400" />;
      case 'deactivated':
        return <ShieldX className="w-8 h-8 text-danger-600" />;
      default:
        return <Fingerprint className="w-8 h-8 text-warning-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (identity.status) {
      case 'active':
        return <span className="badge-success">Active</span>;
      case 'frozen':
        return <span className="badge-danger">Frozen</span>;
      case 'deactivated':
        return <span className="badge-danger bg-danger-500/30 text-danger-300">Deactivated</span>;
      default:
        return <span className="badge-warning">Pending</span>;
    }
  };

  return (
    <div className="card p-8 flex items-center gap-8">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 flex items-center justify-center">
        {getStatusIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-bold text-primary-100">{identity.citizenId}</h2>
          {getStatusBadge()}
        </div>
        <p className="text-primary-400 text-sm">
          Created: {identity.createdAt.toLocaleDateString()}
        </p>
        <div className="flex gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.vouchTokens.length}</p>
            <p className="text-xs text-primary-400">Vouch Tokens</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.isVouchingFor.length}</p>
            <p className="text-xs text-primary-400">Vouching For</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary-100">{identity.fraudStrikes}</p>
            <p className="text-xs text-primary-400">Fraud Strikes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VerificationStepItem {
    id: string;
    label: string;
    icon: React.ElementType;
    isComplete: boolean;
    isCurrent: boolean;
}

interface VerificationPipelineProps {
  identity: IdentityState;
  isScanning: boolean;
  onScan: () => void;
  verificationSteps: VerificationStepItem[];
}

function VerificationPipeline({ identity, isScanning, onScan, verificationSteps }: VerificationPipelineProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-200 mb-6">
        Multi-Step Verification Pipeline
      </h3>
      <div className="grid grid-cols-3 gap-6">
        {verificationSteps.map((step, idx) => (
          <div key={step.id} className="card-elevated p-6 relative">
            {step.isComplete && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className="w-5 h-5 text-success-400" />
              </div>
            )}
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${
                  step.isComplete
                    ? 'bg-success-500/20 border-success-500/30'
                    : step.isCurrent
                    ? 'bg-accent-500/20 border-accent-500/30 animate-pulse'
                    : 'bg-primary-700/50 border-primary-600/30'
                } border`}
              >
                <step.icon
                  className={`w-8 h-8 ${
                    step.isComplete
                      ? 'text-success-400'
                      : step.isCurrent
                      ? 'text-accent-400'
                      : 'text-primary-500'
                  }`}
                />
              </div>
              <h4 className="font-medium text-primary-200">{step.label}</h4>
              <p className="text-xs text-primary-500 mt-1">Step {idx + 1} of 3</p>

              {step.isCurrent && identity.status !== 'frozen' && (
                <button
                  onClick={onScan}
                  disabled={isScanning}
                  className="btn-primary btn mt-4 text-sm"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Verify Now
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface VouchTokensListProps {
  vouchTokens: any[]; // Use any or import VouchToken if possible
}

function VouchTokensList({ vouchTokens }: VouchTokensListProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-primary-200 mb-4">Neighbor Vouch Tokens</h3>

      {vouchTokens.length === 0 ? (
        <div className="text-center py-12 text-primary-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No vouch tokens received yet</p>
          <p className="text-sm mt-1">Complete verification to request neighbor signatures</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {vouchTokens.map((token: any) => (
            <div
              key={token.id}
              className="card-elevated p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-success-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success-400" />
              </div>
              <div>
                <p className="font-medium text-primary-200">{token.neighborName}</p>
                <p className="text-xs text-primary-400">{token.neighborAddress}</p>
                <p className="text-xs text-primary-500 mt-1">
                  {token.signedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function IdentityPage({
  identity,
  onCompleteStep,
}: IdentityPageProps) {""")


with open('src/components/IdentityVerification.tsx', 'w') as f:
    f.write(new_content)
