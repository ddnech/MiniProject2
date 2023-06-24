const { blog: blogController } = require("../controller");
const authMiddleware = require("../middleware/checkAuth");
const authValidator = require("../middleware/validation/auth");
const router = require("express").Router();
const multerUpload = require("../middleware/multer");
const authVerify = require("../middleware/checkVerify")

router.post("/",authMiddleware,authVerify, multerUpload.single("file"),authValidator.validateBlog,blogController.createBlog); //Create Blog
router.get("/",blogController.searchBlogs); //Search Blog
router.get("/user",authMiddleware,blogController.userBlog); //Get User Blog
router.post("/like/:id",authMiddleware,authVerify,blogController.likeBlog) //User Like Blog
router.post("/unlike/:id",authMiddleware,authVerify,blogController.unlikeBlog) //User Unlike Blog
router.get("/top-blogs",blogController.searchTopBlogs) //Search top 8 blogs
router.get("/all-category",blogController.getAllCategory) // get all category
router.get("/:id",blogController.getBlogById); //Search  1 Blog by id
router.patch("/:blog", multerUpload.single("file"),authMiddleware,authVerify,authValidator.validateUpdateBlog,blogController.updateBlog); //Update Blog
router.delete("/delete/:id",authMiddleware,authVerify,blogController.deleteUserBlog); // Delete user

module.exports = router;


