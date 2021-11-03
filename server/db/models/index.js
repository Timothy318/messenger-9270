const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const GroupConversation = require("./groupconversation");
// associations

User.hasMany(Conversation);
Conversation.belongsTo(User, { as: "user1" });
Conversation.belongsTo(User, { as: "user2" });
GroupConversation.belongsToMany(User, { through: 'roomId' });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
  GroupConversation
};
