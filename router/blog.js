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
router.post("/unlike/:id",authMiddleware,authVerify,blogController.unlikeBlog) //User Unlike Blog // change to post
router.get("/top-blogs",blogController.searchTopBlogs) //Search top 8 blogs
router.get("/all-category",blogController.getAllCategory)
router.get("/:id",blogController.getBlogById); //Search  1 Blog by id
router.patch("/:blog", multerUpload.single("file"),authMiddleware,authVerify,authValidator.validateUpdateBlog,blogController.updateBlog); //Update Blog
// router.get("/blog/category", /* controller */) // get list of category
router.delete("/delete/:id",authMiddleware,authVerify,blogController.deleteUserBlog); 
module.exports = router;


