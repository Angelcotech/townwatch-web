// Shared queries used by the public routes.
// Every query is scoped to a jurisdiction_id — TownWatch is multi-tenant
// at the data layer.

import { sql } from "./db";

export type Jurisdiction = {
  id: number;
  name: string;
  display_name: string;
  state_abbr: string;
  state_fips: string;
  county_fips: string | null;
  fips_code: string;
  jurisdiction_type: string;
  population: number | null;
};

export type Official = {
  id: number;
  canonical_name: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  official_website: string | null;
  display_title: string | null;
  is_current: boolean;
  current_seat: string | null;
  votes: number;
  first_vote: Date | null;
  last_vote: Date | null;
};

export type HomeStats = {
  unanimity_pct: number;
  unanimous_count: number;
  voted_count: number;
  total_motions: number;
  total_meetings: number;
  total_officials: number;
  motions_quarantined: number;
};

export type AggregateRow = {
  name: string;
  motions: number;
  official_id: number | null;   // when set, the row links to a profile
  has_photo: boolean;           // true iff a verified photo exists for the official_id
};

export type RecentDecision = {
  id: number;
  title: string;
  outcome: string;
  meeting_date: Date;
};

export type Body = {
  id: number;
  name: string;
  body_type: string;
  meetings: number;
  latest: Date | null;
};

/* ─── jurisdiction lookup ─── */

export async function getJurisdictionBySlug(
  state: string,
  citySlug: string
): Promise<Jurisdiction | null> {
  const rows = await sql<Jurisdiction[]>`
    SELECT id, name, display_name, state_abbr, state_fips, county_fips,
           fips_code, jurisdiction_type, population
    FROM jurisdiction
    WHERE LOWER(state_abbr) = LOWER(${state})
      AND LOWER(REPLACE(name, ' ', '-')) = LOWER(${citySlug})
    LIMIT 1
  `;
  return rows[0] ?? null;
}

/* ─── home page data ─── */

export async function getHomeStats(jurisdictionId: number): Promise<HomeStats> {
  const [unanimity] = await sql<{ unanimous: number; with_votes: number }[]>`
    SELECT
      COUNT(*) FILTER (WHERE vote_tally_no = 0 AND vote_tally_abstain = 0
                         AND vote_tally_yes > 0) AS unanimous,
      COUNT(*) FILTER (WHERE vote_tally_yes > 0 OR vote_tally_no > 0) AS with_votes
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.data_status = 'clean' AND gb.jurisdiction_id = ${jurisdictionId}
  `;

  const [counts] = await sql<{
    total_motions: number;
    total_meetings: number;
    total_officials: number;
    motions_quarantined: number;
  }[]>`
    SELECT
      (SELECT COUNT(*) FROM motion m
        JOIN meeting mtg ON mtg.id = m.meeting_id
        JOIN governing_body gb ON gb.id = mtg.governing_body_id
        WHERE m.data_status = 'clean' AND gb.jurisdiction_id = ${jurisdictionId}) AS total_motions,
      (SELECT COUNT(*) FROM motion m
        JOIN meeting mtg ON mtg.id = m.meeting_id
        JOIN governing_body gb ON gb.id = mtg.governing_body_id
        WHERE m.data_status = 'disputed' AND gb.jurisdiction_id = ${jurisdictionId}) AS motions_quarantined,
      (SELECT COUNT(*) FROM meeting mtg
        JOIN governing_body gb ON gb.id = mtg.governing_body_id
        WHERE gb.jurisdiction_id = ${jurisdictionId}) AS total_meetings,
      (SELECT COUNT(DISTINCT o.id) FROM official o
        JOIN term t ON t.official_id = o.id
        JOIN seat s ON s.id = t.seat_id
        JOIN governing_body gb ON gb.id = s.governing_body_id
        WHERE gb.jurisdiction_id = ${jurisdictionId}) AS total_officials
  `;

  const u = Number(unanimity?.unanimous ?? 0);
  const w = Number(unanimity?.with_votes ?? 0);
  return {
    unanimity_pct: w > 0 ? Math.round((u * 100) / w) : 0,
    unanimous_count: u,
    voted_count: w,
    total_motions: Number(counts?.total_motions ?? 0),
    total_meetings: Number(counts?.total_meetings ?? 0),
    total_officials: Number(counts?.total_officials ?? 0),
    motions_quarantined: Number(counts?.motions_quarantined ?? 0),
  };
}

export async function getCurrentCouncil(jurisdictionId: number): Promise<Official[]> {
  return await sql<Official[]>`
    SELECT
      o.id, o.canonical_name, o.first_name, o.last_name,
      o.email, o.phone, o.official_website, o.display_title,
      TRUE AS is_current,
      s.name AS current_seat,
      (SELECT COUNT(*) FROM vote v
        JOIN motion m ON m.id = v.motion_id
        WHERE v.official_id = o.id AND m.data_status = 'clean')::int AS votes,
      (SELECT MIN(mtg.meeting_date) FROM vote v
        JOIN motion m ON m.id = v.motion_id AND m.data_status = 'clean'
        JOIN meeting mtg ON mtg.id = m.meeting_id
        WHERE v.official_id = o.id) AS first_vote,
      (SELECT MAX(mtg.meeting_date) FROM vote v
        JOIN motion m ON m.id = v.motion_id AND m.data_status = 'clean'
        JOIN meeting mtg ON mtg.id = m.meeting_id
        WHERE v.official_id = o.id) AS last_vote
    FROM official o
    JOIN term t ON t.official_id = o.id AND t.is_current = TRUE
    JOIN seat s ON s.id = t.seat_id
    JOIN governing_body gb ON gb.id = s.governing_body_id
    WHERE gb.jurisdiction_id = ${jurisdictionId}
    ORDER BY s.name
  `;
}

export async function getTopPetitioners(
  jurisdictionId: number,
  limit = 5
): Promise<AggregateRow[]> {
  // Petitioners are free-text right now (no entity table yet), so they
  // can't link to a profile. We return official_id=NULL.
  return await sql<AggregateRow[]>`
    SELECT m.petitioner_name AS name,
           COUNT(*)::int AS motions,
           NULL::int AS official_id,
           FALSE AS has_photo
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.petitioner_name IS NOT NULL
      AND m.data_status = 'clean'
      AND gb.jurisdiction_id = ${jurisdictionId}
    GROUP BY m.petitioner_name
    ORDER BY motions DESC
    LIMIT ${limit}
  `;
}

export async function getTopStaff(
  jurisdictionId: number,
  limit = 5
): Promise<AggregateRow[]> {
  // Staff names live both as free-text on motions AND as resolved
  // official_alias rows (via the staff scraper). When we can match the
  // name to an alias, we surface the official_id so the row links to a
  // profile page.
  return await sql<AggregateRow[]>`
    SELECT m.staff_recommender AS name,
           COUNT(*)::int AS motions,
           (SELECT oa.official_id FROM official_alias oa
            WHERE oa.alias_name = m.staff_recommender LIMIT 1) AS official_id,
           EXISTS(
             SELECT 1 FROM official_photo op
             WHERE op.official_id =
               (SELECT oa.official_id FROM official_alias oa
                WHERE oa.alias_name = m.staff_recommender LIMIT 1)
               AND op.data_status = 'verified'
           ) AS has_photo
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.staff_recommender IS NOT NULL
      AND m.data_status = 'clean'
      AND gb.jurisdiction_id = ${jurisdictionId}
    GROUP BY m.staff_recommender
    ORDER BY motions DESC
    LIMIT ${limit}
  `;
}

export async function getRecentDecisions(
  jurisdictionId: number,
  limit = 5
): Promise<RecentDecision[]> {
  return await sql<RecentDecision[]>`
    SELECT m.id, m.title, m.outcome, mtg.meeting_date
    FROM motion m
    JOIN meeting mtg ON mtg.id = m.meeting_id
    JOIN governing_body gb ON gb.id = mtg.governing_body_id
    WHERE m.data_status = 'clean'
      AND m.outcome IN ('passed', 'failed')
      AND gb.jurisdiction_id = ${jurisdictionId}
    ORDER BY mtg.meeting_date DESC, m.id DESC
    LIMIT ${limit}
  `;
}

export async function getBodies(jurisdictionId: number): Promise<Body[]> {
  return await sql<Body[]>`
    SELECT gb.id, gb.name, gb.body_type,
           COUNT(mtg.id)::int AS meetings,
           MAX(mtg.meeting_date) AS latest
    FROM governing_body gb
    LEFT JOIN meeting mtg ON mtg.governing_body_id = gb.id
    WHERE gb.jurisdiction_id = ${jurisdictionId}
    GROUP BY gb.id, gb.name, gb.body_type
    ORDER BY gb.id
  `;
}

/* ─── photos ─── */

export type OfficialPhoto = {
  photo_url: string;
  photo_mime: string;
  source_url: string;
};

export async function getVerifiedPhoto(
  officialId: number
): Promise<OfficialPhoto | null> {
  const rows = await sql<OfficialPhoto[]>`
    SELECT photo_url, photo_mime, source_url
    FROM official_photo
    WHERE official_id = ${officialId} AND data_status = 'verified'
    ORDER BY verification_score DESC, created_at DESC
    LIMIT 1
  `;
  return rows[0] ?? null;
}
