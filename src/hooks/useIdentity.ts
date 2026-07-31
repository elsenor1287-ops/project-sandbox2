import { useState, useCallback } from 'react';
import type { IdentityState, VerificationStep, VouchToken } from '../types';
import { INITIAL_IDENTITY, MOCK_VOUCH_TOKENS } from '../data/mockData';

export function useIdentity() {
  const [identity, setIdentity] = useState<IdentityState>(INITIAL_IDENTITY);

  const completeVerificationStep = useCallback((step: VerificationStep) => {
    setIdentity(prev => {
      const newIdentity = { ...prev };

      switch (step) {
        case 'passport':
          newIdentity.passportVerified = true;
          newIdentity.verificationStep = 'utility';
          break;
        case 'utility':
          newIdentity.utilityVerified = true;
          newIdentity.verificationStep = 'vouching';
          break;
        case 'vouching':
          newIdentity.vouchTokens = MOCK_VOUCH_TOKENS;
          newIdentity.verificationStep = 'complete';
          newIdentity.status = 'active';
          break;
      }

      return newIdentity;
    });
  }, []);

  const addVouchToken = useCallback((token: VouchToken) => {
    setIdentity(prev => {
      const newTokens = [...prev.vouchTokens, token];
      const isComplete = newTokens.length >= 3;
      return {
        ...prev,
        vouchTokens: newTokens,
        verificationStep: isComplete ? 'complete' : 'vouching',
        status: isComplete ? 'active' : 'pending',
      };
    });
  }, []);

  const triggerFraudStrike = useCallback((reason: string) => {
    setIdentity(prev => {
      const newStrikes = prev.fraudStrikes + 1;
      const shouldFreeze = newStrikes >= 2;
      const shouldDeactivate = newStrikes >= 3;

      return {
        ...prev,
        fraudStrikes: newStrikes,
        status: shouldDeactivate ? 'deactivated' : shouldFreeze ? 'frozen' : prev.status,
        frozenAt: shouldFreeze ? new Date() : undefined,
        frozenReason: shouldFreeze ? reason : undefined,
      };
    });
  }, []);

  const freezeAccount = useCallback((reason: string) => {
    setIdentity(prev => ({
      ...prev,
      status: 'frozen',
      frozenAt: new Date(),
      frozenReason: reason,
      fraudStrikes: 3,
    }));
  }, []);

  const resetIdentity = useCallback(() => {
    setIdentity(INITIAL_IDENTITY);
  }, []);

  return {
    identity,
    completeVerificationStep,
    addVouchToken,
    triggerFraudStrike,
    freezeAccount,
    resetIdentity,
  };
}
