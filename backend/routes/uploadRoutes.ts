import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import sharp from "sharp";
import { protect, requireAdmin } from "../middleware/authMiddleware";

const router = express.Router();

// Use memory storage to process images with Sharp before saving to disk
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpe?g|png|webp/i;
    const mimetype = filetypes.test((file as Express.Multer.File).mimetype);
    const extname = filetypes.test(path.extname((file as Express.Multer.File).originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Apenas são permitidos arquivos de imagem (jpeg, png, webp)!"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.post(
  "/",
  protect,
  requireAdmin,
  upload.array("images", 10),
  async (req: express.Request, res: express.Response) => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
    }

    try {
      const uploadedImagePaths: string[] = [];
      const files = req.files as Express.Multer.File[];
      const rootPath = process.cwd();
      const uploadDir = path.join(rootPath, "uploads");

      // Cria a pasta uploads se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Testa permissão de escrita
      fs.accessSync(uploadDir, fs.constants.W_OK);

      const vehicleName = req.body.vehicleName || "vehicle";
      const sanitizedVehicleName = vehicleName
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");

      for (const [index, file] of files.entries()) {
        const filename = `${index}-${sanitizedVehicleName}-${Date.now()}.webp`;
        const outputPath = path.join(uploadDir, filename);

        await sharp(file.buffer)
          .resize(1200, null, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(outputPath);

        uploadedImagePaths.push(`/uploads/${filename}`);
      }

      res.status(201).json(uploadedImagePaths);
    } catch (error: any) {
      console.error("Image upload error:", error);
      res.status(500).json({
        message: "Erro ao processar as imagens",
        error: error.message,
        stack: error.stack,
      });
    }
  }
);

export default router;
