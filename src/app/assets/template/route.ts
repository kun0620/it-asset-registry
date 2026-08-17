import { toCsv } from "@/lib/assets";

/**
 * Empty CSV with just the header row — same shape /assets/export writes and
 * Settings' CSV import reads, so a filled-in copy of this round-trips
 * cleanly back through Import from CSV.
 */
export async function GET() {
  return new Response(toCsv([]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="asset-import-template.csv"',
    },
  });
}
