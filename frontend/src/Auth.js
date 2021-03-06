import auth0 from "auth0-js";

const authDomain = "dev-9faf5-o9.eu.auth0.com";
const authClientId = "q618pz2fXtpYgmysdNzG0x9tkr1Ql2JS";

const port = process.env.PORT || 5000;

class Auth {
  constructor() {
    this.auth0 = new auth0.WebAuth({
      domain: authDomain,
      audience: "https://" + authDomain + "/userinfo",
      clientID: authClientId,
      redirectUri: "http://localhost:" + port + "/callback",
      responseType: "id_token",
      scope: "openid profile email"
    });

    this.getProfile = this.getProfile.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.SameSite = false;
  }

  getUserEmail() {
    return this.userEmail;
  }

  getProfile() {
    return this.profile;
  }

  getIdToken() {
    return this.idToken;
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt;
  }

  signIn() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash((err, authResult) => {
        if (err) return reject(err);
        if (!authResult || !authResult.idToken) {
          return reject(err);
        }
        this.setSession(authResult);
        resolve();
      });
    });
  }

  setSession(authResult) {
    this.idToken = authResult.idToken;
    this.profile = authResult.idTokenPayload;
    // set the time that the id token will expire at
    this.expiresAt = authResult.idTokenPayload.exp * 1000;
  }

  signOut() {
    this.auth0.logout({
      returnTo: "http://localhost:" + port,
      clientID: authClientId
    });
  }

  silentAuth() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) return reject(err);
        this.setSession(authResult);
        resolve();
      });
    });
  }
}

const auth0Client = new Auth();

export default auth0Client;
