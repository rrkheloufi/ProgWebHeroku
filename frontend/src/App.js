import React, { Component } from "react";
import NavBar from "./NavBar/NavBar";
import Meal from "./Meal/Meal";
import SearchBar from "./Search/Search";
import Callback from "./Callback";
import { Route, withRouter } from "react-router-dom";
import Boxes from "./Boxes/Boxes";
import Box from "./Boxes/Box";
import CreateBox from "./Boxes/CreateBox";
import UpdateBox from "./Boxes/UpdateBox";
import auth0Client from "./Auth";
import SecuredRoute from "./SecuredRoute/SecuredRoute";

// Use Route for routes accessible to everyone.
// Use SecuredRoute for routes accessible only to logged users.
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkingSession: true
    };
  }

  async componentDidMount() {
    if (this.props.location.pathname === "/callback") {
      this.setState({ checkingSession: false });
      return;
    }
    try {
      await auth0Client.silentAuth();
      this.forceUpdate();
    } catch (err) {
      if (err.error !== "login_required") console.log(err.error);
    }
    this.setState({ checkingSession: false });
  }

  render() {
    return (
      <div>
        <NavBar />
        <Route exact path="/" component={SearchBar} />
        <Route exact path="/callback" component={Callback} />
        <Route
          path="/boxes/:userEmail"
          component={Boxes}
          checkingSession={this.state.checkingSession}
        />

        <SecuredRoute
          exact
          path="/box/:id"
          component={Box}
          checkingSession={this.state.checkingSession}
        />
        <SecuredRoute
          exact
          path="/boxes/create"
          component={CreateBox}
          checkingSession={this.state.checkingSession}
        />
        <SecuredRoute
          exact
          path="/boxes/update/:boxId"
          component={UpdateBox}
          checkingSession={this.state.checkingSession}
        />
        <SecuredRoute
          exact
          path="/boxes"
          component={Boxes}
          checkingSession={this.state.checkingSession}
        />
        <Route exact path="/meal/:mealId" component={Meal} />
      </div>
    );
  }
}

export default withRouter(App);
