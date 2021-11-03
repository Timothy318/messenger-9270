const { Op } = require("sequelize");
const db = require("../db");
const Message = require("./message");

const GroupConversation = db.define("groupconversation", {});

//find the group conversation
GroupConversation.findConversation = async function (roomId) {
  const conversation = await GroupConversation.findOne({
    where: {
      roomId: {
        [Op.eq]: roomId
      }
    }
  });
  return conversation;
};

module.exports = GroupConversation;