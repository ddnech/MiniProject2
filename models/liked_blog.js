'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Liked_blog extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Liked_blog.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'cascade', hooks: true });
      Liked_blog.belongsTo(models.Blog, { foreignKey: 'blog_id', onDelete: 'cascade', hooks: true });
    }
  }
  Liked_blog.init({
    blog_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Liked_blog',
  });
  return Liked_blog;
};