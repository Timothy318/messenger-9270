export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...state];
  }

  let start;
  let convos;
  for (let i = 0; i < state.length; i++) {
    if (state[i].id === message.conversationId) {
      const convoCopy = { ...state[i] };
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      start = i;
      convos = convoCopy;
    }
  }
  if (convos) {
    state.splice(start, 1);
    return [convos, ...state];
  } else {
    return state;
  }
};

export const addOnlineUserToStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = true;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map((convo) => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser.online = false;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach((convo) => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach((user) => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  let start;
  let convos;
  for (let i = 0; i < state.length; i++) {
    if (state[i].otherUser.id === recipientId) {
      const convoCopy = { ...state[i] };
      convoCopy.id = message.conversationId;
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      start = i;
      convos = convoCopy;
    }
  }
  if (convos) {
    state.splice(start, 1);
    return [convos, ...state];
  } else {
    return state;
  }
};
