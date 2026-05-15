// Queries for the petitioner profile route.

import { sql } from "./db";

export type PetitionerMotion = {
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

export type PetitionerSummary = {
  motion_count: number;
  total_dollar: number;
  passed: number;
  failed: number;
  tabled: number;
  first_seen: Date | null;
  last_seen: Date | null;
};

export async function getPetitionerSummary(
  jurisdictionId: number,
  petitionerName: string
): Promise<PetitionerSummary | null> {
  const rows = await sql<PetitionerSummary[]>`
    SELECT
      COUNT(*)::int AS motion_count,
      COALESCE(SUM(m.dollar_amount), 0)::numeric AS total_dollar,
      COUNT(*) FILTER (WHERE m.outcome = 'passed')::int AS passed,
      COUNT(*) FILTER (WHERE m.outcome = 'failed')::int AS failed,
      COUNT(*) FILTER (WHERE m.outcome = 'tabled')::int AS tabled,
      MIN(mtg.meeting_date) AS first_seen,
      MAX(mtg.meeting_date) AS last_seen
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.petitioner_name = ${petitionerName}
      AND m.data_status = 'clean'
      AND gb.jurisdiction_id = ${jurisdictionId}
  `;
  if (rows.length === 0 || rows[0].motion_count === 0) return null;
  return rows[0];
}

export async function getPetitionerMotions(
  jurisdictionId: number,
  petitionerName: string
): Promise<PetitionerMotion[]> {
  return await sql<PetitionerMotion[]>`
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
    WHERE m.petitioner_name = ${petitionerName}
      AND m.data_status = 'clean'
      AND gb.jurisdiction_id = ${jurisdictionId}
    ORDER BY mtg.meeting_date DESC, m.id DESC
  `;
}
