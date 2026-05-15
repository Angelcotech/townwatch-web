// Queries scoped to one official's profile page.

import { sql } from "./db";

export type ProfileOfficial = {
  id: number;
  canonical_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  official_website: string | null;
  bio_text: string | null;
  display_title: string | null;
  is_elected: boolean;
};

export type StaffRecommendation = {
  id: number;
  title: string;
  description: string | null;
  discussion_summary: string | null;
  outcome: string;
  motion_type: string;
  dollar_amount: number | null;
  meeting_date: Date;
  body_name: string;
  vote_tally_yes: number;
  vote_tally_no: number;
};

export type ProfileTerm = {
  start_date: Date;
  end_date: Date | null;
  is_current: boolean;
  seat_name: string;
  body_name: string;
  jurisdiction_id: number;
  jurisdiction_name: string;
};

export type VoteBreakdown = {
  motion_type: string;
  total: number;
  yes_count: number;
  no_count: number;
  abstain_count: number;
  recusal_count: number;
};

export type ProfileFinding = {
  pattern_id: string;
  severity: number;
  title: string;
  explanation: string | null;
};

export async function getProfileOfficial(
  officialId: number
): Promise<ProfileOfficial | null> {
  const rows = await sql<ProfileOfficial[]>`
    SELECT id, canonical_name, first_name, last_name, email, phone,
           official_website, bio_text, display_title, is_elected
    FROM official
    WHERE id = ${officialId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getProfileTerms(
  officialId: number
): Promise<ProfileTerm[]> {
  return await sql<ProfileTerm[]>`
    SELECT t.start_date, t.end_date, t.is_current,
           s.name AS seat_name,
           gb.name AS body_name,
           j.id AS jurisdiction_id,
           j.display_name AS jurisdiction_name
    FROM term t
    JOIN seat s ON s.id = t.seat_id
    JOIN governing_body gb ON gb.id = s.governing_body_id
    JOIN jurisdiction j ON j.id = gb.jurisdiction_id
    WHERE t.official_id = ${officialId}
    ORDER BY t.start_date DESC
  `;
}

export async function getVoteBreakdown(
  officialId: number
): Promise<VoteBreakdown[]> {
  return await sql<VoteBreakdown[]>`
    SELECT m.motion_type,
           COUNT(*)::int AS total,
           SUM(CASE WHEN v.vote_value = 'yes' THEN 1 ELSE 0 END)::int AS yes_count,
           SUM(CASE WHEN v.vote_value = 'no' THEN 1 ELSE 0 END)::int AS no_count,
           SUM(CASE WHEN v.vote_value = 'abstain' THEN 1 ELSE 0 END)::int AS abstain_count,
           SUM(CASE WHEN v.vote_value = 'conflict_recusal' THEN 1 ELSE 0 END)::int AS recusal_count
    FROM vote v
    JOIN motion m ON m.id = v.motion_id
    WHERE v.official_id = ${officialId}
      AND m.data_status = 'clean'
    GROUP BY m.motion_type
    ORDER BY total DESC
  `;
}

export async function getProfileFindings(
  officialId: number
): Promise<ProfileFinding[]> {
  return await sql<ProfileFinding[]>`
    SELECT pattern_id, severity, title, explanation
    FROM finding
    WHERE subject_official_id = ${officialId}
      AND pattern_id NOT LIKE 'qa\\_%' ESCAPE '\\'
    ORDER BY severity DESC
  `;
}

export async function getStaffRecommendations(
  officialId: number,
  limit = 50
): Promise<StaffRecommendation[]> {
  // Motions where this person is the recorded staff_recommender. We match
  // either by exact canonical_name or by any alias pointing to this official.
  return await sql<StaffRecommendation[]>`
    SELECT m.id, m.title, m.description, m.discussion_summary,
           COALESCE(m.outcome, '—') AS outcome,
           COALESCE(m.motion_type, 'other') AS motion_type,
           m.dollar_amount,
           mtg.meeting_date,
           gb.name AS body_name,
           COALESCE(m.vote_tally_yes, 0) AS vote_tally_yes,
           COALESCE(m.vote_tally_no, 0) AS vote_tally_no
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.data_status = 'clean'
      AND m.staff_recommender IN (
        SELECT canonical_name FROM official WHERE id = ${officialId}
        UNION
        SELECT alias_name FROM official_alias WHERE official_id = ${officialId}
      )
    ORDER BY mtg.meeting_date DESC, m.id DESC
    LIMIT ${limit}
  `;
}
