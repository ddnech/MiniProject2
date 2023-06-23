const db = require('../models')
const {setFromFileNameToDBValue,getFilenameFromDbValue,getAbsolutePathPublicFile} = require("../utility/file");
const fs = require("fs");

const createBlog = async (req, res) => {
    try {
        const { title, content, keywords, category_id, country,linkUrl } = req.body;
        
        if (req.file) {
        imgBlog = setFromFileNameToDBValue(req.file.filename);
        }

        const blogs = await db.Blog.create({
          author_id: req.user.id,
          title,
          content,
          imgBlog,
          keywords: keywords || null,
          category_id, 
          country: country || null,
          linkUrl: linkUrl || null,
        });
  
        return res.status(202).send(blogs);
      } catch (error) {
        console.log(error);
        res.status(500).send({
          message: "Internal Server Error",
        });
      }
};

const updateBlog = async (req, res) => {
  try {
    const { title, content, keywords, category_id, country,linkUrl  } = req.body;
    const blog = req.params.blog;
    const user_id = req.user.id;

    const updatedBlog = await db.Blog.findOne({
      where: {
        author_id: user_id,
        id: blog,
      },
    });

    if (!updatedBlog) {
      return res.status(400).send({
        message: "Blog not found",
      });
    }

    if (req.file) {
      const realimgBlog = updatedBlog.getDataValue("imgBlog"); //   /public/IMG-16871930921482142001.jpeg
      const oldFilename = getFilenameFromDbValue(realimgBlog); //   IMG-16871930921482142001.jpeg
      console.log(realimgBlog)
      console.log(oldFilename)
      if (oldFilename) {
        fs.unlinkSync(getAbsolutePathPublicFile(oldFilename));
      } 
      updatedBlog.imgBlog = setFromFileNameToDBValue(req.file.filename);
    }

    if (title) {
      updatedBlog.title = title;
    }
    if (content) {
      updatedBlog.content = content;
    }
    if (keywords) {
      updatedBlog.keywords = keywords;
    }
    if (category_id) {
      updatedBlog.category_id = category_id;
    }
    if (country) {
      updatedBlog.country = country;
    }
    if (linkUrl) {
      updatedBlog.linkUrl = linkUrl;
    }

    await updatedBlog.save();

    return res.status(200).send(updatedBlog);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const likeBlog = async (req, res) => {
  try {
    const blogId = parseInt(req.params.id);
    const userId = req.user.id;

    const checkLiked = await db.Liked_blog.findOne({
      where: {
        blog_id: blogId,
        user_id: userId,
      },
    });

    if (checkLiked) {
      return res.status(400).send({
        message: "Blog already liked by the user",
      });
    }

    const blogExists = await db.Blog.findOne({
      where: {
        id: blogId,
      },
    });

    if (!blogExists) {
      return res.status(400).send({
        message: "Blog was not found",
      });
    }

    await db.Liked_blog.create({
      blog_id: blogId,
      user_id: userId,
    });

    return res.status(200).send({
      message: "Blog liked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const unlikeBlog = async (req, res) => {
  try {
    const checkLiked = await db.Liked_blog.findOne({
      where: {
        blog_id:parseInt(req.params.id),
        user_id:req.user.id,
      }
    });
    
    const exist = await db.Liked_blog.findOne({
      where: {
        blog_id:parseInt(req.params.id),
      }
    });

    if(!exist){
      return res.status(400).send({
        message: "Blog was not found",
      });
    }
    if (!checkLiked) {
      return res.status(400).send({
        message: "User has not liked the blog",
      });
    }


    await db.Liked_blog.destroy({
      where:{
        blog_id:parseInt(req.params.id),
        user_id:req.user.id,
      }
    })

    return res.status(200).send({
      message: "Blog unliked successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const userBlog = async (req, res) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 10,
  };

  try {
    const userId = req.user.id;

    const blogs = await db.Blog.findAndCountAll({
      where: {
        author_id: userId,
      },
      limit: pagination.perPage,
      offset: (pagination.page - 1) * pagination.perPage,
    });

    if (blogs.count === 0) {
      return res.status(404).send({
        message: "No blogs created yet",
      });
    }

    const totalPages = Math.ceil(blogs.count / pagination.perPage);

    return res.status(200).send({
      message: "Successfully retrieved blogs",
      pagination: {
        ...pagination,
        totalData: blogs.count,
        totalPages: totalPages,
      },
      data: blogs.rows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const searchBlogs = async (req, res) => {
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 10,
    search: req.query.search || undefined,
    sort: req.query.sort || undefined,
  };

  try {
    const filterOptions = {};

    if (pagination.search) {
      filterOptions[db.Sequelize.Op.or] = [
        {
          title: {
            [db.Sequelize.Op.like]: `%${pagination.search}%`,
          },
        },
        {
          keywords: {
            [db.Sequelize.Op.like]: `%${pagination.search}%`,
          },
        },
      ];
    }

    if (req.query.categoryId) {
      filterOptions.category_id = req.query.categoryId;
    }

    const order = pagination.sort === 'oldest' ? 'ASC' : 'DESC';

    const results = await db.Blog.findAndCountAll({
      where: filterOptions,
      include: [
        {
          model: db.User,
          attributes: ['id', 'username'],
        },
        {
          model: db.Category,
        },
      ],
      limit: pagination.perPage,
      offset: (pagination.page - 1) * pagination.perPage,
      order: [['createdAt', order]],
    });

    const totalCount = results.count;
    pagination.totalData = totalCount;

    if (results.rows.length === 0) {
      return res.status(404).send({
        message: 'No blogs found',
      });
    }

    res.send({
      message: 'Successfully retrieved blogs',
      pagination,
      data: results.rows.map((blog) => {
        return {
          blog_id: blog.id,
          title: blog.title,
          content: blog.content,
          imgBlog: blog.imgBlog,
          country:blog.country,
          linkUrl:blog.linkUrl,
          keywords:blog.keywords,
          author: {
            id: blog.User.id,
            username: blog.User.username,
          },
          Category:blog.Category.name
        };
      }),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: 'Internal Server Error',
      error: error.message,
    });
  }
};

const searchTopBlogs = async (req, res) => {
  try {
    const results = await db.Liked_blog.findAll({
      attributes: [
        "blog_id",
        [db.sequelize.fn("COUNT", db.sequelize.col("user_id")), "likeCount"],
      ],
      include: [
  
        {
          model: db.Blog,
          attributes: ["title", "content", "imgBlog", "author_id","country","linkUrl","keywords",],
          include: [
            {
              model: db.User,
              attributes: ["username"],
            },
            {
              model: db.Category,
              attributes: ["name"],
            },
          ],
        },
      ],
      group: ["blog_id"],
      order: [[db.sequelize.literal("likeCount"), "DESC"]],
      limit: 10,
    });

    if (results.length === 0) {
      return res.status(404).send({
        message: "No blogs found",
      });
    }

    res.send({
      message: "Successfully retrieved top blogs",
      data: results,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const getCategories = await db.Category.findAll({
      attributes: ["id", "name"],
    });

    if (getCategories.length === 0) {
      return res.status(400).send({ message: "No category found" });
    }
    return res.status(200).send({
      message: "Successfully get all categories",
      data: getCategories,
    });
  } catch (error) {
    res.status(500).send({
      message: "Fatal error on server",
      errors: error.message,
    });
  }
};

const getBlogById = async (req, res) => {
  try {

    const blog = await db.Blog.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: db.User,
          attributes: ["username"],
        },
        {
          model: db.Category,
          attributes: ["name"],
        },
      ],
    });

    if (!blog) {
      return res.status(404).send({
        message: "Blog not found",
      });
    }

    return res.send({
      message: "Successfully retrieved blog",
      data: blog,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const deleteUserBlog = async (req,res) => {
  const id = Number(req.params.id);
  const author_id = req.user.id;
  try {
    const getBlog = await db.Blog.findOne({
      where: {
        id,
        author_id,
      },
    });
    if (!getBlog) {
      return res.status(400).send({
        message: "Blog doesn't exist",
      });
    }
    const imgBlog = getBlog.getDataValue("imgBlog");
    
    await getBlog.destroy();

    
    if (imgBlog) {
      fs.unlinkSync(
        getAbsolutePathPublicFile(getFilenameFromDbValue(imgBlog))
        );
      }
    
    res.send({ message: "Successfully deleted the blog" });
  
  } catch (error) {
    res.status(500).send({
      message: "Fatal error on server",
      errors: error.message,
    });
  }
}


module.exports = {
    createBlog,
    updateBlog,
    likeBlog,
    unlikeBlog,
    userBlog,
    searchBlogs,
    searchTopBlogs,
    getAllCategory,
    getBlogById,
    deleteUserBlog,
};

