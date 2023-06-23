const { user: userController } = require("../controller");
const authMiddleware = require("../middleware/checkAuth");
const router = require("express").Router();
const multerUpload = require("../middleware/multer");
const authValidator = require("../middleware/validation/auth");

router.get("/profile",authMiddleware,userController.getProfile) // Get User Profile
router.patch("/profile",authMiddleware,authValidator.validateChangeProfile,userController.changeProfile) //Change User Profile
router.patch("/profile-img",authMiddleware,multerUpload.single("file"),userController.changeProfileImg) //Change User Profile image
router.get("/liked-blogs",authMiddleware,userController.getUserLikedBlog) //Change User Profile
router.patch("/change-pass",authMiddleware,authValidator.validateChangePassword,userController.changePassword) //Change User Profile

module.exports = router;

