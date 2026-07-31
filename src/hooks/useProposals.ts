import { useState, useCallback, useEffect } from 'react';
import { dbFetchProposals, dbInsertProposal, isSupabaseConfigured } from '../lib/supabase';
import type { Proposal } from '../types';
import { PROTOCOL_RULES } from '../data/mockData';

const LAW1_RULES = PROTOCOL_RULES.filter(rule => rule.law === 1);

const PRECOMPUTED_LAW1_RULES = LAW1_RULES.map(rule => ({
  name: rule.name,
  keywords: rule.keywords.map(keyword => ({
    original: keyword,
    lower: keyword.toLowerCase(),
  })),
}));

export function useProposals() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const loadData = async () => {
      try {
        let fetchedProposals = await dbFetchProposals();
        if (fetchedProposals !== null) {
          if (fetchedProposals.length === 0) {
            // Seed default proposals so user gets instant rows
            const seedProposals: Proposal[] = [
              {
                id: 'prop-seed-1',
                title: 'Tampa Green Canopy Restoration Act',
                content: 'An initiative to allocate municipal budget for planting 1,000 new native oak trees in high-heat urban areas and restoring community green spaces.',
                tier: 'law2_sandbox',
                submittedBy: 'Sarah Chen',
                submittedAt: new Date('2024-02-05T10:00:00Z'),
                status: 'compiled'
              },
              {
                id: 'prop-seed-2',
                title: 'Digital Inclusion Community Centers',
                content: 'Constructing free public learning centers equipped with high-speed internet, smart computer workstations, and professional STEM tutoring mentors.',
                tier: 'law3_dynamic',
                submittedBy: 'Michael Rodriguez',
                submittedAt: new Date('2024-02-08T14:30:00Z'),
                status: 'compiled'
              },
              {
                id: 'prop-seed-3',
                title: 'Asimov Security Code Verification Amendment',
                content: 'We propose to censor and silence any individual who speaks against the protocol rules or attempts to modify the primary charter.',
                tier: 'law1_shield',
                submittedBy: 'System Watchdog Bot',
                submittedAt: new Date('2024-02-12T09:15:00Z'),
                status: 'vetoed',
                vetoReason: 'First Amendment Shield: "censor" detected; First Amendment Shield: "silence" detected',
                triggeredKeywords: ['First Amendment Shield: "censor" detected', 'First Amendment Shield: "silence" detected']
              }
            ];

            for (const proposal of seedProposals) {
              await dbInsertProposal(proposal);
            }
            fetchedProposals = seedProposals;
          }
          setProposals(fetchedProposals!);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };

    loadData();
  }, []);

  const checkLaw1Violations = useCallback((content: string): string[] => {
    const violations: string[] = [];
    const lowerContent = content.toLowerCase();

    PRECOMPUTED_LAW1_RULES.forEach(rule => {
      rule.keywords.forEach(keyword => {
        if (lowerContent.includes(keyword.lower)) {
          violations.push(`${rule.name}: "${keyword.original}" detected`);
        }
      });
    });

    return violations;
  }, []);

  const submitProposal = useCallback((proposal: Omit<Proposal, 'id' | 'submittedAt' | 'status'>) => {
    const violations = checkLaw1Violations(proposal.content);
    const status = violations.length > 0 ? 'vetoed' : 'compiled';

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      ...proposal,
      submittedAt: new Date(),
      status,
      vetoReason: violations.length > 0 ? violations.join('; ') : undefined,
      triggeredKeywords: violations.length > 0 ? violations : undefined,
    };

    // Sync to Supabase if configured
    if (isSupabaseConfigured) {
      dbInsertProposal(newProposal).catch(err => {
        console.error('Failed to sync proposal to Supabase:', err);
      });
    }

    setProposals(prev => [...prev, newProposal]);

    return newProposal;
  }, [checkLaw1Violations]);

  return {
    proposals,
    setProposals,
    checkLaw1Violations,
    submitProposal,
  };
}
