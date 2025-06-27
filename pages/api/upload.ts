import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = "/tmp";
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File upload error" });
    }
    // For demo: just return file info
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    return res.status(200).json({
      name: file[0]?.originalFilename || file[0]?.newFilename,
      size: file[0]?.size,
      path: file[0]?.filepath,
    });
  });
}
