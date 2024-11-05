"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Post.belongsTo(models.User, {
        foreignKey: "publisher_id",
        as: "publisher",
      });

      Post.hasMany(models.Like, {
        foreignKey: "post_id",
        as: "likes",
      });

      Post.hasMany(models.Comment, {
        foreignKey: "post_id",
        as: "comments",
      });
    }
  }
  Post.init(
    {
      publisher_id: DataTypes.INTEGER,
      text: DataTypes.STRING,
      image: DataTypes.STRING,
      like_count: DataTypes.INTEGER,
      comment_count: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Post",
    }
  );
  return Post;
};
