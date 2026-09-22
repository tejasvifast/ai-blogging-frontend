import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * On-demand ISR webhook. The backend POSTs here after post/category mutations
 * (see ai-blogging-backend/src/modules/revalidation/revalidation.service.ts):
 *   POST /api/revalidate
 *   headers: { "x-revalidate-secret": <REVALIDATE_SECRET> }
 *   body:    { "paths": ["/", "/blog", "/blog/my-post", ...] }
 * The shared secret must match the backend's REVALIDATE_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  // Fail closed: if no secret is configured, don't allow revalidation.
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  let paths: unknown;
  try {
    ({ paths } = await req.json());
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(paths) || paths.length === 0) {
    return NextResponse.json(
      { success: false, error: "`paths` must be a non-empty array" },
      { status: 400 },
    );
  }

  // Only revalidate safe, in-app absolute paths.
  const valid = paths.filter(
    (p): p is string => typeof p === "string" && p.startsWith("/") && !p.startsWith("//"),
  );
  for (const path of valid) revalidatePath(path);

  return NextResponse.json({ success: true, revalidated: valid });
}
