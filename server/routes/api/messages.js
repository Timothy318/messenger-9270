const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const { recipientId, text, conversationId, sender } = req.body;

    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    // if conversation exists with given senderId & recipient id & if we already know conversation id.
    if (conversation && conversationId) {
      if (conversation.id === conversationId) {
        const message = await Message.create({ senderId, text, conversationId, isRead: false });
        return res.json({ message, sender });
      } else {
        return res.sendStatus(404);
      }
    }

    if (!conversation) {
      // create conversation
      if (senderId !== sender.id) {
        return res.sendStatus(404);
      }
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
      isRead: false
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
