import express from "express";
import path from "path";
import multer from "multer";
import sharp from "sharp";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		const filetypes = /jpe?g|png|webp/i;
		const mimetype = filetypes.test((file as Express.Multer.File).mimetype);
		const extname = filetypes.test(path.extname((file as Express.Multer.File).originalname));
		if (mimetype && extname) return cb(null, true);
		cb(new Error("Apenas imagens (jpeg, png, webp) são permitidas"));
	},
	limits: { fileSize: 5 * 1024 * 1024 },
});

// @desc    Upload single chat image and return URL
// @route   POST /api/chat/upload
// @access  Public (rate-limit at reverse proxy or app level)
router.post("/", upload.single("image"), async (req, res) => {
	if (!req.file) return res.status(400).json({ message: "Nenhuma imagem foi enviada" });
	try {
		const rootPath = process.cwd();
		const filename = `chat-${Date.now()}.webp`;
		const outputPath = path.join(rootPath, "uploads", filename);
		await sharp(req.file.buffer)
			.resize(1600, null, { fit: "inside", withoutEnlargement: true })
			.webp({ quality: 82 })
			.toFile(outputPath);
		return res.status(201).json({ url: `/uploads/${filename}` });
	} catch (e) {
		console.error("Chat image upload error:", e);
		return res.status(500).json({ message: "Erro ao processar a imagem" });
	}
});

export default router;