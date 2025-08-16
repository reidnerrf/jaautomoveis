import express from 'express';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Use memory storage to process images with Sharp before saving to disk
const storage = multer.memoryStorage();

const upload = multer({ 
    storage, 
    // Inlining the fileFilter allows TypeScript to correctly infer parameter types
    // from Multer's options, avoiding type conflicts.
    fileFilter: (req, file, cb) => {
        const filetypes = /jpe?g|png|webp/i;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname));

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error(`Error: Apenas são permitidos arquivos de imagem (jpeg, png, webp)!`));
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// @desc    Upload images, process them, and return their paths
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, upload.array('images', 10), async (req: express.Request, res: express.Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({ message: 'Nenhuma imagem foi enviada' });
    }

    try {
        const uploadedImagePaths: string[] = [];
        const files = req.files as Express.Multer.File[];
        const rootPath = path.resolve();
        const vehicleName = req.body.vehicleName || 'vehicle';

        // Sanitize the vehicle name to create a URL-friendly slug
        const sanitizedVehicleName = vehicleName
            .toString()
            .toLowerCase()
            .replace(/\s+/g, '-')       // Replace spaces with -
            .replace(/[^\w-]+/g, '')   // Remove all non-word chars except -
            .replace(/--+/g, '-')     // Replace multiple - with single -
            .replace(/^-+/, '')         // Trim - from start of text
            .replace(/-+$/, '');        // Trim - from end of text

        for (const [index, file] of files.entries()) {
            // Generate a unique filename using index, sanitized name, and timestamp
            const filename = `${index}-${sanitizedVehicleName}-${Date.now()}.webp`;
            const outputPath = path.join(rootPath, 'uploads', filename);

            // Process image with Sharp: resize and convert to WebP
            await sharp(file.buffer)
                .resize(1200, null, { fit: 'inside', withoutEnlargement: true }) // Resize width to 1200px max
                .webp({ quality: 80 }) // Convert to webp with 80% quality
                .toFile(outputPath);
            
            uploadedImagePaths.push(`/uploads/${filename}`);
        }
        
        res.status(201).json(uploadedImagePaths);

    } catch (error) {
        console.error('Image upload error:', error);
        res.status(500).json({ message: 'Erro ao processar as imagens' });
    }
});

export default router;