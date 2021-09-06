import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Backdrop,
  Box,
  Button,
  CardActions,
  CardContent,
  Divider,
  Fade,
  makeStyles,
  Modal,
  Typography,
} from "@material-ui/core";
import { AddCircleRounded as UploadIcon } from "@material-ui/icons";
import { FormProvider, useForm } from "react-hook-form";
import AsyncButton from "../../components/AsyncButton/index.js";
import {
  eventValidation,
  preferencesValidation,
} from "../../../../common/validation";
import SelectInput from "../../controls/SelectInput";
import AutocompleteInput from "../../controls/AutocompleteInput";
import TextInput from "../../controls/TextInput";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateTimeInput from "../../controls/DateTimeInput/index.js";
import hrLocale from "date-fns/locale/hr";
import { postEvent } from "../../services/event.js";
import { patchPreferences } from "../../services/user.js";
import { useSnackbar } from "notistack";
import { vaccines } from "../../../../common/constants";
import DateInput from "../../controls/DateInput/index.js";
import { format, setHours } from "date-fns";
import { useUserStore } from "../../contexts/user.js";
import DeactivateModal from "../DeactivateModal/index.js";

const useStyles = makeStyles((muiTheme) => ({
  modalWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    backgroundColor: muiTheme.palette.background.paper,
    boxShadow: muiTheme.shadows[5],
    padding: muiTheme.spacing(2),
    borderRadius: muiTheme.spacing(0.5),
    maxWidth: 320,
    width: "100%",
    margin: "0 16px",
  },
  modalContent: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  modalTitle: {
    paddingBottom: muiTheme.spacing(2),
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 0,
  },
  modalHidden: {
    display: "none",
  },
  divider: {
    margin: "12px 0",
  },
  deactivate: {
    marginTop: "12px",
  },
}));

const SettingsModal = ({
  modal,
  shouldHide,
  handleToggleModal,
  handleActionModal,
}) => {
  const id = useUserStore((state) => state.id);
  const reminders = useUserStore((state) => state.reminders);
  const updateReminders = useUserStore((state) => state.updateReminders);

  const classes = useStyles();

  const { handleSubmit, formState, errors, control, reset } = useForm({
    defaultValues: {
      userReminders: reminders,
    },
    resolver: yupResolver(preferencesValidation),
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleConfirm = async (values) => {
    const { data } = await patchPreferences.request({
      userId: id,
      data: values,
    });

    if (data.message === "Success") {
      updateReminders({ reminders: values.userReminders });
      enqueueSnackbar(patchPreferences.success.message, {
        variant: patchPreferences.success.variant,
      });
    }
  };

  useEffect(() => {
    reset({ userReminders: reminders });
  }, [modal]);

  return (
    <Modal
      className={`${classes.modalWrapper} ${shouldHide && classes.modalHidden}`}
      open={modal.open}
      onClose={handleToggleModal}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={modal.open}>
        <Box className={classes.modalContainer}>
          <Typography className={classes.modalTitle}>Postavke</Typography>
          <Divider />
          <FormProvider control={control}>
            <form onSubmit={handleSubmit(handleConfirm)}>
              <CardContent className={classes.modalContent}>
                <Typography>Izbrišite korisnički račun</Typography>
                <Typography>
                  Brisanjem korisničkog računa nestat će svi pacijenti i datumi
                  cijepljenja
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  className={classes.deactivate}
                  onClick={handleActionModal}
                >
                  Deaktivacija
                </Button>
                <Divider className={classes.divider} />
                <SelectInput
                  name="userReminders"
                  label="Primanje podsjetnika: "
                  errors={errors}
                  options={[
                    { value: "enabled", text: "Uključeno" },
                    { value: "disabled", text: "Isključeno" },
                  ]}
                />
              </CardContent>
              <CardActions className={classes.modalActions}>
                <AsyncButton
                  type="submit"
                  fullWidth
                  variant="outlined"
                  color="primary"
                  padding
                  loading={formState.isSubmitting}
                  startIcon={<UploadIcon />}
                >
                  Spremi
                </AsyncButton>
                <Button
                  type="button"
                  variant="outlined"
                  color="dark"
                  onClick={handleToggleModal}
                >
                  Odustani
                </Button>
              </CardActions>
            </form>
          </FormProvider>
        </Box>
      </Fade>
    </Modal>
  );
};

export default SettingsModal;
