// Queries for a governing body's profile route — the body itself plus
// every meeting indexed under it.

import { sql } from "./db";

export type BodyProfile = {
  id: number;
  name: string;
  body_type: string;
  jurisdiction_id: number;
  jurisdiction_name: string;
  state_abbr: string;
};

export type BodyMeeting = {
  id: number;
  meeting_date: Date;
  meeting_type: string;
  status: string | null;
  agenda_url: string | null;
  minutes_url: string | null;
  motion_count: number;          // 0 if minutes haven't been extracted yet
  quorum_present: boolean | null;
};

export async function getBodyById(bodyId: number): Promise<BodyProfile | null> {
  const rows = await sql<BodyProfile[]>`
    SELECT gb.id, gb.name, gb.body_type,
           j.id AS jurisdiction_id,
           j.display_name AS jurisdiction_name,
           j.state_abbr
    FROM governing_body gb
    JOIN jurisdiction j ON j.id = gb.jurisdiction_id
    WHERE gb.id = ${bodyId}
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function getBodyMeetings(bodyId: number): Promise<BodyMeeting[]> {
  return await sql<BodyMeeting[]>`
    SELECT m.id, m.meeting_date,
           COALESCE(m.meeting_type, 'regular') AS meeting_type,
           m.status,
           m.agenda_url, m.minutes_url,
           m.quorum_present,
           (SELECT COUNT(*)::int FROM motion mo
            WHERE mo.meeting_id = m.id AND mo.data_status = 'clean') AS motion_count
    FROM meeting m
    WHERE m.governing_body_id = ${bodyId}
    ORDER BY m.meeting_date DESC, m.id DESC
  `;
}
