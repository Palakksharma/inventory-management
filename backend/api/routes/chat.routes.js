// import express from 'express';
// import { getChatHistory } from '../controllers/chat.controller.js';
// import { protect } from '../middlewares/auth.middleware.js'; 

// const router = express.Router();


// router.get('/:manifestId', protect, getChatHistory);

// export default router;
import express from 'express';
import { getChatHistory, sendMessage } from '../controllers/chat.controller.js'; // Import both
import { protect } from '../middlewares/auth.middleware.js'; 

const router = express.Router();

router.get('/:manifestId', protect, getChatHistory);
router.post('/:manifestId', protect, sendMessage); // ADD THIS LINE

export default router;