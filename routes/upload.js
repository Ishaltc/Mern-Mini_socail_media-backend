const express = require('express');
const { listImages, uploadImages } = require('../controllers/upload');

const { authUser } = require('../middleware/auth');
const { imageUpload } = require('../middleware/imageUpload');



const router = express.Router();
 
// for uploading images to the cloudinary
 router.post("/uploadImages", uploadImages)

 // getting images from the cloudinary
router.post("/listImages" ,authUser ,listImages)








module.exports = router;