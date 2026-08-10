import { NextResponse } from "next/server";
import { db } from "@/db";
import { moduleConfigs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const configs = await db
      .select()
      .from(moduleConfigs)
      .orderBy(desc(moduleConfigs.createdAt))
      .limit(10);

    return NextResponse.json(configs);
  } catch {
    return NextResponse.json([]);
  }
}
