import axios from "axios";
import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import LoadingSpinner from "./components/LoadingSpinner";
import { useUserStore } from "./contexts/user.js";
import App from "./App.js";
import { postLogout } from "./services/auth.js";
import { useSnackbar } from "notistack";

const ax = axios.create();

const Interceptor = () => {
  const userToken = useUserStore((state) => state.token);
  const loading = useUserStore((state) => state.loading);
  const setUser = useUserStore((state) => state.setUser);
  const updateUser = useUserStore((state) => state.updateUser);
  const resetUser = useUserStore((state) => state.resetUser);

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const getRefreshToken = async () => {
    try {
      if (!userToken) {
        const { data } = await axios.post("/api/auth/refresh_token", {
          headers: {
            credentials: "include",
          },
        });

        if (data.user) {
          setUser({
            authenticated: true,
            token: data.accessToken,
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            reminders: data.user.reminders,
            loading: false,
          });
        } else {
          setUser({
            authenticated: false,
            token: "",
            id: "",
            name: "",
            email: "",
            reminders: "",
            loading: false,
          });
        }
      }
    } catch (err) {}
  };

  const interceptTraffic = (token) => {
    if (token) {
      ax.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete ax.defaults.headers.common["Authorization"];
    }

    ax.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response.status !== 401) {
          enqueueSnackbar(error.response.data.error, {
            variant: "error",
          });
          return new Promise((resolve, reject) => {
            reject(error);
          });
        }

        if (
          error.config.url === "/api/auth/refresh_token" ||
          error.response.message === "Forbidden"
        ) {
          await postLogout.request();
          resetUser();
          history.push("/login");

          return new Promise((resolve, reject) => {
            reject(error);
          });
        }

        const { data } = await axios.post("/api/auth/refresh_token", {
          headers: {
            credentials: "include",
          },
        });
        updateUser({
          token: data.accessToken,
          email: data.user.email,
        });
        const config = error.config;
        config.headers["Authorization"] = `Bearer ${data.accessToken}`;
        return new Promise((resolve, reject) => {
          axios
            .request(config)
            .then((response) => {
              resolve(response);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }
    );
  };

  useEffect(() => {
    getRefreshToken();
  }, []);

  useEffect(() => {
    interceptTraffic(userToken);
  }, [userToken]);

  return loading ? <LoadingSpinner /> : <App />;
};

export { ax };
export default Interceptor;
