class Session {
  constructor() {
    if (!Session.instance) {
      Session.instance = this;
    }

    return Session.instance;
  }

  isStarted = false;
}

const session = new Session();

export default session;
