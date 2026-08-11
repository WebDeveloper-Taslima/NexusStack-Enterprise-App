import { Router } from 'express';
import multer from 'multer';
import { itemController } from '../controllers/itemController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/items', itemController.getItems);
router.get('/items/:id', itemController.getItemById);
router.post('/items', itemController.createItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);

// Data upload workflow
router.post('/items/upload', upload.single('file'), itemController.uploadData);

// DB Stats
router.get('/db/stats', itemController.getDbStats);

export default router;
