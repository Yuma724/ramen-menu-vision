import { NextResponse } from "next/server";
import { aggregateFeeds } from "@/lib/feeds/registry";

// Always run dynamically; the adapters apply their own caching via fetch.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await aggregateFeeds();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to aggregate feeds" },
      { status: 500 }
    );
  }
}
