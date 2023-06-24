const db = require('../models');
const {setFromFileNameToDBValue,getFilenameFromDbValue,getAbsolutePathPublicFile} = require("../utility/file");
const fs = require("fs");
const nodemailer = require('nodemailer');
const hbs = require("handlebars");
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const transporter = nodemailer.createTransport({
  service: process.env.service_email,
  auth: {
    user: process.env.email_name, 
    pass: process.env.email_password, 
  },
});

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await db.User.findByPk(userId, {
      attributes: ['id', 'username','email','phone','imgProfile', 'isVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    return res.status(200).send(user);
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const changeProfile = async (req, res) => {
  const { username, email, phone } = req.body;
  try {
    const user = await db.User.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    if (username) {
      user.username = username;
    }
    if (phone) {
      user.phone = phone;
    }

    if (email) {
      const verifyToken = crypto.randomBytes(20).toString("hex");

      user.email = email;
      user.isVerified = false;
      user.verificationToken = verifyToken;

      const verificationLink = `${process.env.link_email}${verifyToken}`;

      const template = fs.readFileSync(
        "./templates/reVerify.html",
        "utf-8"
      );
      const templateCompile = hbs.compile(template);
      const htmlResult = templateCompile({ username, verificationLink });

      const nodemailerEmail = {
        from: process.env.email_name,
        to: email,
        subject:
          "Proccessing your update request. Please re-verify your email!",
        html: htmlResult,
      };

      transporter.sendMail(nodemailerEmail, (error, info) => {
        if (error) {
          return res.status(500).json({ error: "Error sending email" });
        }
      });
    }

    await user.save();

    // if email, ask to check email. else, no
    if (email) {
      return res.status(201).send({
        message:
          "Successfully update profile. Please check your email to re-verify your account",
        data: {
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      });
    } else {
      return res.status(201).send({
        message: "Successfully update profile",
        data: {
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const changePassword= async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await db.User.findOne({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
      return res.status(404).send({
        message: "Incorrect old password. Please try again",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;

    await user.save();

    return res.status(200).send({
      message: "Successfully change the password. Try logging in now!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
}

const changeProfileImg = async (req, res) => {
  try {

    const user = await db.User.findOne({
      where: {
        id: req.user.id
      }
    });

    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    if (!req.file) {
      return res.status(400).send({ message: "Please upload a picture" });
    }

    if (req.file) {
      const realImgProfile = user.getDataValue("imgProfile");
      const oldFilename = getFilenameFromDbValue(realImgProfile);
      if (oldFilename) {
        fs.unlinkSync(getAbsolutePathPublicFile(oldFilename));
      }
      user.imgProfile = setFromFileNameToDBValue(req.file.filename);
    } 
    await user.save();

    return res.status(200).send({
      message: "Profile image change successful",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
};

const getUserLikedBlog = async (req, res) => {
  const user_id = req.user.id;
  const pagination = {
    page: Number(req.query.page) || 1,
    perPage: Number(req.query.perPage) || 10,
  };

  try {
    const offset = (pagination.page - 1) * pagination.perPage;

    const checkLikedBlogs = await db.Liked_blog.findAndCountAll({
      where: {
        user_id,
      },
      include: db.Blog,
      limit: pagination.perPage,
      offset: offset,
    });

    const totalCount = checkLikedBlogs.count;
    pagination.totalCount = totalCount;

    if (checkLikedBlogs.rows.length === 0) {
      return res.status(404).send({
        message: "User has not liked any blogs",
      });
    }

    res.status(200).send({
      message: "Successfully get liked blogs",
      pagination,
      data: checkLikedBlogs.rows.map((likedBlog) => likedBlog.Blog),
    });
  } catch (error) {
    res.status(500).send({
      message: "Fatal error on server",
      errors: error.message,
    });
  }
};

async function deleteUser(req, res) {
  const userId = req.user.id;

  try {
    const user = await db.User.findByPk(userId, { include: db.Blog });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }


    const imgProfile = user.getDataValue("imgProfile");

    const blogs = user.Blogs;
    for (const blog of blogs) {
      const imgBlog = blog.getDataValue("imgBlog");
      if (imgBlog) {
        fs.unlinkSync(getAbsolutePathPublicFile(getFilenameFromDbValue(imgBlog)));
      }
    }

    await user.destroy();

    if (imgProfile) {
      fs.unlinkSync(getAbsolutePathPublicFile(getFilenameFromDbValue(imgProfile)));
    }

    res.status(200).send({ message: "User account has been succesfully deleted" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Errror", errors: error.message });
  }
}


  
module.exports = {
  getProfile,
  changeProfile,
  changeProfileImg,
  getUserLikedBlog,
  changePassword,
  getUserLikedBlog,
  deleteUser,
};