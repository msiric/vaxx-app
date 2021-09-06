import { yupResolver } from "@hookform/resolvers/yup";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Grid,
  Link,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { LockRounded as LoginAvatar } from "@material-ui/icons";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { loginValidation } from "../../../common/validation";
import AsyncButton from "../components/AsyncButton/index.js";
import { useUserStore } from "../contexts/user.js";
import TextInput from "../controls/TextInput/index.js";
import { postLogin } from "../services/auth.js";
import { useHistory, Link as RouterLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.primary.main,
  },
}));

const Login = () => {
  const setUser = useUserStore((state) => state.setUser);

  const { handleSubmit, formState, errors, control } = useForm({
    defaultValues: {
      userUsername: "",
      userPassword: "",
    },
    resolver: yupResolver(loginValidation),
  });

  const history = useHistory();
  const classes = useStyles();

  const onSubmit = async (values) => {
    const { data } = await postLogin.request({ data: values });

    if (data.user) {
      setUser({
        authenticated: true,
        token: data.accessToken,
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        reminders: data.user.reminders,
      });
    }
    history.push("/");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LoginAvatar />
        </Avatar>
        <Typography component="h1" variant="h5">
          Prijava
        </Typography>
        <FormProvider control={control}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
              <TextInput
                name="userUsername"
                type="text"
                label="Korisničko ime"
                errors={errors}
              />
              <TextInput
                name="userPassword"
                type="password"
                label="Zaporka"
                errors={errors}
              />
            </Box>
            <AsyncButton
              type="submit"
              fullWidth
              variant="outlined"
              color="primary"
              padding
              loading={formState.isSubmitting}
            >
              Prijavi se
            </AsyncButton>
            <Grid container className={classes.actions}>
              <Grid item>
                <Link component={RouterLink} to="/signup" variant="body2">
                  Novi korisnik? Registriraj se
                </Link>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default Login;
