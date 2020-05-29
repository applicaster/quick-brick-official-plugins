class Session {
  constructor() {
    if (!Session.instance) {
      Session.instance = this;
    }

    return Session.instance;
  }

  navBarHidden = null;
}

const session = new Session();

export default session;
