import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const VALID_CATEGORIES = [
  "starters",
  "grill",
  "curries",
  "biryani",
  "sides",
  "desserts",
  "hero",
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const category = formData.get("category") as string | null;
    const slug = formData.get("slug") as string | null;

    if (!file || !category || !slug) {
      return NextResponse.json({ error: "Missing file, category or slug" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP allowed" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Sanitise slug — only alphanumeric and hyphens
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${slug}.${ext}`;

    const base = process.env.PUBLIC_IMAGES_DIR ?? path.join(process.cwd(), "public", "images");
    const dir = category === "hero" ? path.join(base, "hero") : path.join(base, "menu", category);

    await mkdir(dir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path.join(dir, filename), buffer);

    const publicPath =
      category === "hero"
        ? `/images/hero/${filename}`
        : `/images/menu/${category}/${filename}`;

    return NextResponse.json({ success: true, path: publicPath });
  } catch (err) {
    console.error("Image upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
