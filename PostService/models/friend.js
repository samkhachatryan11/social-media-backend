"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Friend.init(
    {
      sender_id: DataTypes.INTEGER,
      receiver_id: DataTypes.INTEGER,
      is_accepted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Friend",
    }
  );
  return Friend;
};
