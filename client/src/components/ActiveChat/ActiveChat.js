import { makeStyles } from "@material-ui/core/styles";
import { Box } from "@material-ui/core";
import { Input, Header, Messages } from "./index";
import { connect } from "react-redux";
import React, { useEffect, useState, useMemo } from "react";
import { setMessagesRead } from "../../store/utils/thunkCreators";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexGrow: 8,
    flexDirection: "column"
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    justifyContent: "space-between"
  }
}));

const ActiveChat = (props) => {
  const classes = useStyles();
  const { user, setMessagesRead } = props;
  const [lastReadIndex, setLastReadIndex] = useState(0);
  //const conversation = props.conversation || {};
  const conversation = useMemo(() => props.conversation || {}, [props.conversation]);


  useEffect(() => {
    let hasUnreadMessage = false;
    if (conversation && conversation.messages) {
      for (let i = conversation.messages.length - 1; i >= 0; i--) {
        if (!conversation.messages[i].isRead && conversation.messages[i].senderId === conversation.otherUser.id) {
          hasUnreadMessage = true;
        }
        if (conversation.messages[i].isRead && conversation.messages[i].senderId === user.id) {
          setLastReadIndex(conversation.messages[i].id);
          break;
        }
      }
    }
    if (hasUnreadMessage) {
      async function messageRead() {
        await setMessagesRead({
          conversationId: conversation.id,
          senderId: conversation.otherUser.id,
          recipientId: user.id
        });
      }
      if (conversation && conversation.otherUser && conversation.id) {
        messageRead();
      }
    }

  }, [user, conversation, setMessagesRead]);


  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              lastReadIndex={lastReadIndex}
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
    conversation:
    {
      ...(state.conversations &&
        state.conversations.find(
          (conversation) => conversation.otherUser.username === state.activeConversation
        ))
    }
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setMessagesRead: (body) => {
      dispatch(setMessagesRead(body));
    },
  };
};



export default connect(mapStateToProps, mapDispatchToProps)(ActiveChat);
