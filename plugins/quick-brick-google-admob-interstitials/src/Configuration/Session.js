class Session {
  constructor() {
    if (!Session.instance) {
      Session.instance = this;
    }
    return Session.instance;
  }

  displayedAds = [];
}

const session = new Session();

export default session;
