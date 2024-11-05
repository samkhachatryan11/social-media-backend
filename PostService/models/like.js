"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Like extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Like.belongsTo(models.User, {
        foreignKey: "liker_id",
        as: "liker",
      });

      Like.belongsTo(models.Post, {
        foreignKey: "post_id",
      });

      Like.belongsTo(models.User, {
        foreignKey: "author_id",
        as: "author",
      });
    }
  }
  Like.init(
    {
      liker_id: DataTypes.INTEGER,
      post_id: DataTypes.INTEGER,
      author_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Like",
    }
  );
  return Like;
};
