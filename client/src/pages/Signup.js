import { yupResolver } from "@hookform/resolvers/yup";
import { makeStyles } from "@material-ui/core/styles";
import { MeetingRoomRounded as SignupAvatar } from "@material-ui/icons";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useHistory, Link as RouterLink } from "react-router-dom";
import { signupValidation } from "../../../common/validation";
import AsyncButton from "../components/AsyncButton/index";
import { postSignup } from "../services/auth";
import TextInput from "../controls/TextInput/index.js";
import {
  Avatar,
  Box,
  Container,
  Typography,
  Grid,
  Link,
} from "@material-ui/core";

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

const Signup = () => {
  const { handleSubmit, formState, errors, control } = useForm({
    defaultValues: {
      userUsername: "",
      userEmail: "",
      userPassword: "",
      userConfirm: "",
    },
    resolver: yupResolver(signupValidation),
  });

  const history = useHistory();
  const classes = useStyles();

  const onSubmit = async (values) => {
    const { data } = await postSignup.request({ data: values });

    if (data.message === "Success") {
      history.push("/login");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box className={classes.paper}>
        <Avatar className={classes.avatar}>
          <SignupAvatar />
        </Avatar>
        <Typography component="h1" variant="h5">
          Registracija
        </Typography>
        <FormProvider control={control}>
          <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
            <Box>
              <TextInput
                name="userUsername"
                type="text"
                label="Korisničko ime"
                errors={errors}
              />
              <TextInput
                name="userEmail"
                type="text"
                label="Email adresa"
                errors={errors}
              />
              <TextInput
                name="userPassword"
                type="password"
                label="Zaporka"
                errors={errors}
              />
              <TextInput
                name="userConfirm"
                type="password"
                label="Ponovljena zaporka"
                errors={errors}
              />
            </Box>
            <AsyncButton
              type="submit"
              fullWidth
              padding
              loading={formState.isSubmitting}
            >
              Registriraj se
            </AsyncButton>
            <Grid container className={classes.actions}>
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Postojeći korisnik? Ulogiraj se
                </Link>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </Box>
    </Container>
  );
};

export default Signup;
