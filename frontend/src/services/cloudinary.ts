import { UploadProgress } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  publicId: string;
}

async function getUploadSignature(publicId: string): Promise<SignatureResponse> {
  const response = await fetch(`${API_URL}/cloudinary/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, folder: 'snapbooth' }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get upload signature: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadToCloudinary(
  dataUrl: string,
  publicId: string,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  // Get signature from backend
  const { signature, timestamp, cloudName, apiKey, folder } = await getUploadSignature(publicId);

  // Convert data URL to blob
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  // Build form data
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);
  formData.append('folder', folder);
  formData.append('public_id', `${folder}/${publicId}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          publicId: data.public_id,
          url: data.url,
          secureUrl: data.secure_url,
          width: data.width,
          height: data.height,
          format: data.format,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
    xhr.send(formData);
  });
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch(`${API_URL}/cloudinary/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete: ${response.statusText}`);
  }
}

export function getCloudinaryThumbnail(
  secureUrl: string,
  width = 400,
  height = 300
): string {
  // Transform the URL to get a thumbnail
  return secureUrl.replace('/upload/', `/upload/c_fill,w_${width},h_${height},q_80/`);
}

// Track upload state
const uploadStates = new Map<string, UploadProgress>();

export function getUploadState(id: string): UploadProgress | undefined {
  return uploadStates.get(id);
}

export function setUploadState(state: UploadProgress): void {
  uploadStates.set(state.id, state);
}
