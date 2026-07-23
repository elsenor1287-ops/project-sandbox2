import { createClient } from '@supabase/supabase-js';
import type { Proposal, BallotSubmission } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://offsicarzljenjrzfant.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Supabase client initialization. Note that the client won't work correctly
// for real API requests if the anon key is empty or default, so we check configurations.
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'your_supabase_anon_key'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey || 'dummy-key');

export async function dbFetchProposals(): Promise<Proposal[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.warn('Supabase fetch proposals error:', error.message);
      return null;
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      tier: item.tier,
      submittedBy: item.submitted_by,
      submittedAt: new Date(item.submitted_at),
      status: item.status,
      vetoReason: item.veto_reason,
      triggeredKeywords: item.triggered_keywords,
    }));
  } catch (err) {
    console.error('Failed to fetch proposals:', err);
    return null;
  }
}

export async function dbInsertProposal(proposal: Proposal): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('proposals').insert([{
      id: proposal.id,
      title: proposal.title,
      content: proposal.content,
      tier: proposal.tier,
      submitted_by: proposal.submittedBy,
      submitted_at: proposal.submittedAt.toISOString(),
      status: proposal.status,
      veto_reason: proposal.vetoReason || null,
      triggered_keywords: proposal.triggeredKeywords || null,
    }]);

    if (error) {
      console.warn('Supabase insert proposal error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert proposal:', err);
    return false;
  }
}

export async function dbInsertProposals(proposals: Proposal[]): Promise<boolean> {
  if (!isSupabaseConfigured || proposals.length === 0) return false;
  try {
    const records = proposals.map(proposal => ({
      id: proposal.id,
      title: proposal.title,
      content: proposal.content,
      tier: proposal.tier,
      submitted_by: proposal.submittedBy,
      submitted_at: proposal.submittedAt.toISOString(),
      status: proposal.status,
      veto_reason: proposal.vetoReason || null,
      triggered_keywords: proposal.triggeredKeywords || null,
    }));

    const { error } = await supabase.from('proposals').insert(records);

    if (error) {
      console.warn('Supabase bulk insert proposals error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to bulk insert proposals:', err);
    return false;
  }
}

export async function dbFetchBallotSubmissions(): Promise<BallotSubmission[] | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('ballot_submissions')
      .select('*');

    if (error) {
      console.warn('Supabase fetch ballot submissions error:', error.message);
      return null;
    }

    return (data || []).map(item => ({
      voterId: item.voter_id,
      rankings: item.rankings,
      writeIn: item.write_in,
      submittedAt: new Date(item.submitted_at),
    }));
  } catch (err) {
    console.error('Failed to fetch submissions:', err);
    return null;
  }
}

export async function dbInsertBallotSubmission(submission: BallotSubmission): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('ballot_submissions').upsert([{
      voter_id: submission.voterId,
      rankings: submission.rankings,
      write_in: submission.writeIn || null,
      submitted_at: submission.submittedAt.toISOString(),
    }]);

    if (error) {
      console.warn('Supabase insert submission error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to insert submission:', err);
    return false;
  }
}

export async function dbInsertBallotSubmissions(submissions: BallotSubmission[]): Promise<boolean> {
  if (!isSupabaseConfigured || submissions.length === 0) return false;
  try {
    const records = submissions.map(submission => ({
      voter_id: submission.voterId,
      rankings: submission.rankings,
      write_in: submission.writeIn || null,
      submitted_at: submission.submittedAt.toISOString(),
    }));

    const { error } = await supabase.from('ballot_submissions').upsert(records);

    if (error) {
      console.warn('Supabase bulk insert submissions error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to bulk insert submissions:', err);
    return false;
  }
}

export async function dbResetVotingSubmissions(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('ballot_submissions').delete().neq('voter_id', '');
    if (error) {
      console.warn('Supabase reset submissions error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to reset submissions:', err);
    return false;
  }
}
