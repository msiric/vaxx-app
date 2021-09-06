import React, { useState } from "react";
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
import { DeleteRounded as DeleteIcon } from "@material-ui/icons";
import AsyncButton from "../../components/AsyncButton/index.js";
import { deleteEvent } from "../../services/event.js";
import { useSnackbar } from "notistack";
import { subMinutes } from "date-fns";
import { useUserStore } from "../../contexts/user.js";
import { deactivateUser } from "../../services/user.js";
import { postLogout } from "../../services/auth.js";

const useStyles = makeStyles((muiTheme) => ({
  modalWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: muiTheme.palette.background.paper,
    boxShadow: muiTheme.shadows[5],
    padding: muiTheme.spacing(2),
    borderRadius: muiTheme.spacing(0.5),
    maxWidth: 320,
    width: "100%",
    margin: "0 16px",
  },
  modalTitle: {
    paddingBottom: muiTheme.spacing(2),
  },
  modalActions: {
    display: "flex",
    justifyContent: "space-between",
    paddingRight: 0,
    paddingLeft: 0,
  },
}));

const DeactivateModal = ({ modal, handleToggleModal }) => {
  const id = useUserStore((state) => state.id);
  const resetUser = useUserStore((state) => state.resetUser);

  const [isDeleting, setIsDeleting] = useState(false);
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await deactivateUser.request({
        userId: id,
      });

      if (data.message === "Success") {
        await postLogout.request();
        resetUser();
        window.location.href = "/login";
        enqueueSnackbar(deactivateUser.success.message, {
          variant: deactivateUser.success.variant,
        });
      }
    } catch (err) {
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      className={classes.modalWrapper}
      open={modal.open}
      onClose={handleToggleModal}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={modal.open}>
        <Box className={classes.modalContent}>
          <Typography className={classes.modalTitle}>
            Izbrisati korisnički račun?
          </Typography>
          <Divider />
          <CardActions className={classes.modalActions}>
            <AsyncButton
              type="submit"
              fullWidth
              variant="outlined"
              color="primary"
              padding
              onClick={handleDelete}
              loading={isDeleting}
              startIcon={<DeleteIcon />}
            >
              Potvrdi
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
        </Box>
      </Fade>
    </Modal>
  );
};

export default DeactivateModal;
