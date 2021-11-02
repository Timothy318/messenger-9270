import React, { useEffect, useState } from "react";
import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { Search, Chat, CurrentUser } from "./index.js";

const useStyles = makeStyles(() => ({
  root: {
    paddingLeft: 21,
    paddingRight: 21,
    flexGrow: 1
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.29,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 15
  }
}));

const Sidebar = (props) => {
  const classes = useStyles();
  const conversations = props.conversations;
  const { handleChange, searchTerm } = props;
  const [counts, setCounts] = useState({});

  useEffect(() => {
    let map = {};
    conversations.forEach(conversation => {
      conversation.messages.forEach((message) => {
        if (message.isRead !== true && message.senderId === conversation.otherUser.id) {
          if (!map[conversation.id]) {
            map[conversation.id] = 1;
          } else {
            map[conversation.id] += 1;
          }
        }
      });
    });
    setCounts(map);
  }, [setCounts, conversations]);
  
  return (
    <Box className={classes.root}>
      <CurrentUser />
      <Typography className={classes.title}>Chats</Typography>
      <Search handleChange={handleChange} />
      {conversations.filter((conversation) => conversation.otherUser.username.includes(searchTerm)).map((conversation) => {
          return <Chat conversation={conversation} key={conversation.otherUser.username} unreadMessagesCount={counts[conversation.id]} />;
        })}
    </Box>
  );
};

const mapStateToProps = (state) => {
  return {
    conversations: state.conversations
  };
};

export default connect(mapStateToProps)(Sidebar);
