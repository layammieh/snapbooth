// Cloudinary is optional and disabled for local photobooth operation
export const cloudinary = {
  utils: {
    api_sign_request: () => '',
  },
  uploader: {
    destroy: async () => ({ result: 'ok' }),
  },
  search: {
    expression: () => ({
      max_results: () => ({
        execute: async () => ({ resources: [] }),
      }),
    }),
  },
};

export function isCloudinaryConfigured(): boolean {
  return false;
}

