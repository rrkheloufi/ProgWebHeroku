import React from "react";
import { Route } from "react-router-dom";
import auth0Client from "../Auth";

function SecuredRoute(props) {
  const { component: Component, path, checkingSession } = props;
  return (
    <Route
      exact
      path={path}
      render={props => {
        if (checkingSession)
          return (
            <div>
              <h3 className="text-center">
                Validating session{" "}
                <div className="spinner-grow text-secondary" role="status" />
                <div className="spinner-grow text-secondary" role="status" />
                <div className="spinner-grow text-secondary" role="status" />
              </h3>
            </div>
          );
        if (!auth0Client.isAuthenticated()) {
          auth0Client.signIn();
          return <div></div>;
        }
        return <Component {...props} />;
      }}
    />
  );
}

export default SecuredRoute;
