import { Request, Response } from 'express';

export async function generateSignature(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    message: 'Cloudinary disabled. Photos are processed and downloaded locally.',
    cloudConfigured: false,
  });
}

export async function deleteImage(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ result: 'ok' });
}

export async function listImages(_req: Request, res: Response): Promise<void> {
  res.status(200).json({ resources: [] });
}

