const { auth: authController } = require("../controller");
const authValidator = require("../middleware/validation/auth");
const router = require("express").Router();

router.post("/register",authValidator.validateRegister,authController.registerUser); // Register new User
router.post("/login", authController.loginUser); // Login User
router.patch("/verify", authController.verifyUser); // Verify User
router.post("/forgot-pass", authController.sendResetPassword); // Forgot password( get body from email)
router.post("/reset-pass", authController.resetPassword);

module.exports = router;

// router.post("/auth/forget-password", /* controller */) // forget password
// router.patch("/auth/reset-password", /* controller */) // reset password
