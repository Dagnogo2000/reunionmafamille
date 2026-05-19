import { put, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

export async function uploadFile(file: File, prefix: string): Promise<string> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`${prefix}_${Date.now()}_${file.name}`, file, {
      access: 'public',
    });
    return blob.url;
  } else {
    const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    
    const ext = path.extname(file.name);
    const filename = `${prefix}_${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    return `/uploads/${filename}`;
  }
}

export async function deleteFile(fileUrl: string) {
  if (!fileUrl) return;
  if (fileUrl.startsWith('http') && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(fileUrl);
  } else if (fileUrl.startsWith('/uploads')) {
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
