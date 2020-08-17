import React from "react";
import { Route, Switch } from "react-router-dom";

import CreateList from "./components/lists/CreateList";
import EditTask from "./components/tasks/EditTask";
import HomeContainer from "./containers/HomeContainer";
import Settings from "./components/auth/Settings";
import List from "./components/lists/List";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function Routes() {
  return (
    <Switch>
      <ProtectedRoute path="/" exact={true} component={HomeContainer} />
      <ProtectedRoute path="/create-list" component={CreateList} />
      <ProtectedRoute path="/edit-task/:taskId" component={EditTask} />
      <ProtectedRoute path="/lists/:listId" component={List} />
      <ProtectedRoute path="/settings" component={Settings} />

      <Route path="/register" render={(props) => <Register {...props} />} />
      <Route path="/login" render={(props) => <Login {...props} />} />
    </Switch>
  );
}