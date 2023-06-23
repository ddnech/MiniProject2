const bcrypt = require('bcrypt');
const { User } = require('../models');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models');
const fs = require('fs');
const hbs = require("handlebars");
const dayjs = require('dayjs');

const transporter = nodemailer.createTransport({
    service: process.env.service_email,
    auth: {
      user: process.env.email_name, 
      pass: process.env.email_password, 
    },
});

const sendResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const resetPasswordToken = crypto.randomBytes(20).toString('hex');

    // Calculate the expiration date (1 hour from now) using dayjs
    const expirationDate = dayjs().add(1, 'hour');

    // Find the user based on the email
    const dbUser = await User.findOne({ where: { email } });
    if (!dbUser) {
      return res.status(404).json({ error: 'Email doesnt exist' });
    }
 
    dbUser.resetPasswordToken = resetPasswordToken;
    dbUser.expiredResetPasswordToken = expirationDate.toDate(); // Convert to JavaScript Date object
    await dbUser.save();

    const verificationLink = `${process.env.link_email}${resetPasswordToken}`;
 
    const template = fs.readFileSync("./templates/reset.html", "utf-8");

    const templateCompile = hbs.compile(template);
    const htmlResult = templateCompile({ username: dbUser.username, verificationLink });

    const mailOptions = {
      from: process.env.email_name,
      to: email,
      subject: 'Account Verification',
      html: htmlResult,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).json({ message: 'Email sent successfully' });
      }
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('Duplicate entry error:', error.errors[0].message);
      res.status(409).json({ error: 'One or more account details already exist' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const resetPassword = async (req,res) => {
  try {
    const { newPassword} = req.body;
    const resetPasswordToken = req.query.token

    const existToken = await db.User.findOne({
      where: { resetPasswordToken },
    });

    if (!existToken) {
      return res.status(404).send({
        message: "Token invalid",
      });
    }

    const tokenCA = new Date(existToken.expiredResetPasswordToken);
    const now = new Date();

    if (now > tokenCA) {
      return res.status(400).send({
        message: "token is already expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    existToken.password = hashedPassword;
    existToken.resetPasswordToken = null;
    existToken.expiredResetPasswordToken = null;
    
    await existToken.save();

    return res.status(200).send({
      message: "Reset password succesfully, try login now",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
    });
  }
}

const registerUser = async (req, res) => {
  try {

    const { username, email, phone, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    const user = await User.create({
      username,
      email,
      phone,
      password: hashedPassword,
      imgProfile: null,
      isVerified: false,
      verificationToken,
      resetPasswordToken: null,
      expiredResetPasswordToken: null,

    });
    
    const verificationLink = `${process.env.link_email}${verificationToken}`;

    // Read the email template file
    const template = fs.readFileSync("./templates/register.html", "utf-8");
    // Compile the Handlebars template
    const templateCompile = hbs.compile(template);
    const htmlResult = templateCompile({ username,verificationLink });

    const mailOptions = {
      from: process.env.email_name,
      to: email,
      subject: 'Account Verification',
      html: htmlResult,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Internal server error' });
      } else {
        console.log('Email sent:', info.response);
        res.status(201).json(user);
      }
    });

  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('Duplicate entry error:', error.errors[0].message);
      res.status(409).json({ error: 'One or more account details already exist' });
    } else {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

const verifyUser = async (req, res) => {
    const { token } = req.query;
  
    try {
      const user = await User.findOne({
        where: {
          verificationToken: token,
        },
      });
  
      if (!user) {
        return res.status(404).json({
          error: 'Verification token is invalid',
        });
      }
  
      await User.update(
        { isVerified: true, verificationToken: null },
        { where: { verificationToken: token } }
      );
  
  
      return res.status(200).json({ message: 'Account verification successful' });
    } catch (error) {
      console.error('Error verifying user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
};

const generateJWTToken = (user) => {
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      process.env.secret_key
    );
    return token;
};

const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({
      where: {
        [db.Sequelize.Op.or]: [
          { username: identifier },
          { phone: identifier },
          { email: identifier },
        ],
      },
    });

    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        console.log(user.id)
        const token = generateJWTToken(user); 
        res.json({ message: 'Login successful', token, data: user.id });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials or user not verified' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    registerUser,
    verifyUser,
    loginUser,
    sendResetPassword,
    resetPassword,
};