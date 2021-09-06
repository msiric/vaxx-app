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
    padding: 0,
  },
}));

const DeleteModal = ({
  modal,
  setEvents,
  setPatients,
  setAvailableSlot,
  handleToggleModal,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const { data } = await deleteEvent.request({ eventId: modal.id });
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== modal.id)
      );
      const deletedPatient = data.payload.patient;
      if (deletedPatient) {
        setPatients((prevPatients) =>
          prevPatients.filter((patient) => patient.id !== deletedPatient)
        );
      } else {
        setPatients((prevPatients) =>
          prevPatients.map((patient) =>
            patient.id === modal.patient
              ? { ...patient, vaxxed: "first" }
              : { ...patient }
          )
        );
      }
      setAvailableSlot(subMinutes(new Date(modal.date), 15));
      handleToggleModal();
      enqueueSnackbar(deleteEvent.success.message, {
        variant: deleteEvent.success.variant,
      });
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
        <Box className={classes.modalContainer}>
          <Typography className={classes.modalTitle}>
            Izbriši termin?
          </Typography>
          <Divider />
          <CardContent className={classes.modalContent}>
            {modal.title ? (
              <>
                <Typography>{modal.title}</Typography>
                <Typography>{modal.dob || "Nema podataka"}</Typography>
                <Typography>{modal.mbo || "Nema podataka"}</Typography>
                <Typography>{modal.identifier}</Typography>
                <Typography>{modal.appointment}</Typography>
              </>
            ) : null}
          </CardContent>
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
              Izbriši
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

export default DeleteModal;
