"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Comment.belongsTo(models.User, {
        foreignKey: "commenter_id",
        as: "commenter",
      });

      Comment.belongsTo(models.Post, {
        foreignKey: "post_id",
      });

      Comment.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });
    }
  }
  Comment.init(
    {
      commenter_id: DataTypes.INTEGER,
      post_id: DataTypes.INTEGER,
      author_id: DataTypes.INTEGER,
      comment_text: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Comment",
    }
  );
  return Comment;
};
