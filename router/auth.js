const { auth: authController } = require("../controller");
const authValidator = require("../middleware/validation/auth");
const router = require("express").Router();

router.post("/register",authValidator.validateRegister,authController.registerUser); // Register new User
router.post("/login", authController.loginUser); // Login User
router.patch("/verify", authController.verifyUser); // Verify User
router.post("/forgot-pass", authController.sendResetPassword); // Forgot password
router.post("/reset-pass", authController.resetPassword); // reset user password

module.exports = router;
