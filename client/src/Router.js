import React, { lazy, Suspense } from "react";
import { Redirect, Route, Router, Switch } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner/index.js";
import { useUserStore } from "./contexts/user.js";
import AuthLayout from "./layouts/AuthLayout.js";
import MainLayout from "./layouts/MainLayout.js";
import history from "./utils/history.js";

const routes = [
  {
    path: "/login",
    Component: lazy(() => import("./pages/Login")),
    exact: true,
    type: "auth",
  },
  {
    path: "/signup",
    Component: lazy(() => import("./pages/Signup")),
    exact: true,
    type: "auth",
  },
  {
    path: "/",
    Component: lazy(() => import("./pages/Home")),
    exact: true,
    type: "protected",
  },
];

const AppRoute = ({ component: Component, layout: Layout, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      if (rest.type === "auth") {
        if (!rest.token) {
          return (
            <AuthLayout>
              <Suspense fallback={<LoadingSpinner />}>
                <Component key={props.location.key} {...props} />
              </Suspense>
            </AuthLayout>
          );
        } else {
          return (
            <Redirect
              to={{
                pathname: "/",
                state: {
                  from: props.location,
                },
              }}
            />
          );
        }
      } else if (rest.type === "protected") {
        if (!rest.token) {
          return (
            <Redirect
              to={{
                pathname: "/login",
                state: {
                  from: rest.location,
                },
              }}
            />
          );
        }
      }
      return (
        <MainLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <Component key={props.location.key} {...props} />
          </Suspense>
        </MainLayout>
      );
    }}
  />
);

const AppRouter = () => {
  const userToken = useUserStore((state) => state.token);

  return (
    <Router history={history}>
      <Route
        render={(route) => {
          const { location } = route;
          return (
            <Switch location={location}>
              {routes.map(({ path, Component, exact, type }) => (
                <AppRoute
                  token={userToken}
                  type={type}
                  path={path}
                  key={path}
                  exact={exact}
                  layout={path}
                  component={Component}
                />
              ))}
              <Redirect to="/404" />
            </Switch>
          );
        }}
      />
    </Router>
  );
};
export default AppRouter;
