import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  try {
    const { publicId } = await context.params;

    if (!publicId || !publicId.trim()) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    const success =
      !result.error &&
      typeof result.result === "string" &&
      result.result.toLowerCase() === "ok";

    return NextResponse.json({ success }, { status: success ? 200 : 400 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
