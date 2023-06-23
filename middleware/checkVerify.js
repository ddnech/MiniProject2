const db = require('../models');

const checkVerify = async (req, res, next) => {
    try {
        const user = await db.User.findOne({
          where: {
            id: req.user.id,
            isVerified:true,
          }
        });
    
        if (!user) {
          return res.status(404).send({
            message: "User has not been verify",
          });
        }

        next();
      } catch (error) {
        console.log(error);
        return res.status(500).send({
          message: "Internal Server Error",
        });
      }
  };
  
  module.exports = checkVerify;