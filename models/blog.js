"use strict";
const { Model } = require("sequelize");
const { convertFromDBtoRealPath } = require("../utility/file");
module.exports = (sequelize, DataTypes) => {
  class Blog extends Model {
    static associate(models) {
      // Define associations here
      Blog.belongsTo(models.User, { foreignKey: "author_id" });
      Blog.hasMany(models.Liked_blog, { foreignKey: "blog_id" });
      Blog.belongsTo(models.Category, { foreignKey : "category_id"})
    }
  }
  Blog.init(
    {
      author_id: DataTypes.INTEGER,
      imgBlog: {
        type: DataTypes.STRING,
        get() {
          const rawValue = this.getDataValue ("imgBlog");
          if (rawValue) {
            return convertFromDBtoRealPath(rawValue);
          }
          return null
        }
      },
      linkUrl: DataTypes.STRING,
      title: DataTypes.STRING,
      content: DataTypes.STRING,
      keywords: DataTypes.STRING,
      country: DataTypes.STRING,
      category_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Blog",
    }
  );
  return Blog;
};

