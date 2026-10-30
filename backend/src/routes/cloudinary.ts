import { Router } from 'express';
import { generateSignature, deleteImage, listImages } from '../controllers/cloudinary';

const router = Router();

router.post('/sign', generateSignature);
router.post('/delete', deleteImage);
router.get('/list', listImages);

export default router;
