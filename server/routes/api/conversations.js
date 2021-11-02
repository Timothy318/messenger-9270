const router = require("express").Router();
const { User, Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ["id"],
      order: [[Message, "createdAt", "ASC"]],
      include: [
        { model: Message, order: ["createdAt", "ASC"] },
        {
          model: User,
          as: "user1",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
        {
          model: User,
          as: "user2",
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ["id", "username", "photoUrl"],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      const latestMessageIndex = convoJSON.messages.length - 1;
      convoJSON.latestMessageText = convoJSON.messages[latestMessageIndex].text;
      conversations[i] = convoJSON;
    }
      conversations.sort((a, b) =>
      b.messages[b.messages.length - 1].createdAt - a.messages[a.messages.length - 1].createdAt
    );

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.put("/read", async (req, res, next) => {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;
    const { senderId, conversationId, recipientId } = req.body;
    if (userId !== recipientId) {
      return res.sendStatus(401);
    }
    const conversation = await Conversation.findConversation(senderId, recipientId);
    if (!conversation) {
      return res.sendStatus(404);
    }
    const messages = await Message.findAll({
      where: {
        senderId: senderId,
        conversationId: conversation.id,
        isRead: false
      }
    });
    if (!messages || messages.length == 0) {
      return res.sendStatus(404);
    }
    const saveMessages = messages.map((message) => {
      message.isRead = true;
      return message;
    });
    messages.forEach(async (message) => {
      await Message.update({ isRead: true },{
        where: {
          id: message.id
        }
      });
    });
    return res.send({ conversationId, messages: saveMessages });
});
module.exports = router;
