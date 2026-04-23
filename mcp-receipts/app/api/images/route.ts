import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

const RECEIPT_FOLDER = "receipts";

type ImageUploadResultDto = {
  publicId: string | null;
  url: string | null;
  error: string | null;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result: ImageUploadResultDto = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: RECEIPT_FOLDER,
            resource_type: "image",
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }

            resolve({
              publicId: uploadResult?.public_id ?? null,
              url: uploadResult?.secure_url ?? null,
              error: null,
            });
          },
        );

        stream.end(buffer);
      },
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Image upload failed.";

    return NextResponse.json(
      {
        publicId: null,
        url: null,
        error: message,
      },
      { status: 500 },
    );
  }
}
