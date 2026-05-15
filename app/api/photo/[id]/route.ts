// Serves verified official photos from Postgres BYTEA.
// (Will be replaced with Cloudflare R2 URLs in a follow-up — see migration plan.)

import { sql } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const officialId = Number(id);
  if (!Number.isFinite(officialId)) {
    return new Response("Bad request", { status: 400 });
  }

  const rows = await sql<{ photo_bytes: Buffer; photo_mime: string }[]>`
    SELECT photo_bytes, photo_mime
    FROM official_photo
    WHERE official_id = ${officialId} AND data_status = 'verified'
      AND photo_bytes IS NOT NULL
    ORDER BY verification_score DESC, created_at DESC
    LIMIT 1
  `;

  if (rows.length === 0) {
    return new Response("Not found", { status: 404 });
  }
  const { photo_bytes, photo_mime } = rows[0];

  return new Response(new Uint8Array(photo_bytes), {
    headers: {
      "Content-Type": photo_mime || "image/jpeg",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
