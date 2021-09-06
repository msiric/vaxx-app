import React, { useEffect } from "react";
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
import { eventValidation } from "../../../../common/validation";
import SelectInput from "../../controls/SelectInput";
import AutocompleteInput from "../../controls/AutocompleteInput";
import TextInput from "../../controls/TextInput";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateTimeInput from "../../controls/DateTimeInput/index.js";
import hrLocale from "date-fns/locale/hr";
import { postEvent } from "../../services/event.js";
import { useSnackbar } from "notistack";
import { vaccines } from "../../../../common/constants";
import DateInput from "../../controls/DateInput/index.js";
import { format, setHours } from "date-fns";

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
}));

const AppointmentModal = ({
  modal,
  patients,
  options,
  setEvents,
  setPatients,
  evaluateNewestDate,
  handleToggleModal,
}) => {
  const classes = useStyles();

  const {
    handleSubmit,
    formState,
    errors,
    control,
    setValue,
    trigger,
    getValues,
    watch,
    reset,
  } = useForm({
    defaultValues: {
      patientVaxxed: "first",
      patientName: "",
      patientDOB: null,
      patientMBO: "",
      patientVaccine: "moderna",
      vaccineIdentifier: "",
      patientDate: modal.date,
    },
    resolver: yupResolver(eventValidation),
  });

  const { enqueueSnackbar } = useSnackbar();

  const handleConfirm = async (values) => {
    const formattedDOB = new Date(new Date(values.patientDOB).toDateString());

    const { data } = await postEvent.request({
      data: { ...values, patientDOB: formattedDOB },
    });

    const eventData = data.payload.event;
    const patientData = data.payload.patient;
    const addedEvent = {
      title: `${patientData.name} - ${
        eventData.type === "first" ? "Prva doza" : "Druga doza"
      }`,
      id: eventData.id,
      date: eventData.date,
      dob: patientData.dob,
      mbo: patientData.mbo,
      editable: true,
      vaccine: patientData.vaccine,
      identifier: eventData.identifier,
      specifiedDate: eventData.date,
      backgroundColor: `${vaccines[patientData.vaccine].color}`,
      patientId: patientData.id,
    };

    setEvents((prevEvents) => [...prevEvents, addedEvent]);
    if (patientData) {
      const foundPatient = patients.find(
        (patient) => patient.id === patientData.id
      );
      if (!foundPatient) {
        setPatients((prevPatients) => [...prevPatients, patientData]);
      } else {
        setPatients((prevPatients) =>
          prevPatients.map((patient) =>
            patient.id === foundPatient.id
              ? { ...patient, vaxxed: eventData.type }
              : { ...patient }
          )
        );
      }
    }
    evaluateNewestDate(eventData.date);
    handleToggleModal();
    enqueueSnackbar(postEvent.success.message, {
      variant: postEvent.success.variant,
    });
  };

  const patientName = watch("patientName");
  const patientVaxxed = watch("patientVaxxed");

  const renderVaccines = () => {
    const value = getValues("patientName");
    const vaccineTypes = Object.entries(vaccines);
    if (patientVaxxed === "second") {
      const foundPatient = patients.find((patient) => patient.name === value);
      if (foundPatient && foundPatient.vaccine) {
        setValue("patientVaccine", foundPatient.vaccine);
        return [
          {
            value: foundPatient.vaccine,
            text: vaccines[foundPatient.vaccine].label,
          },
        ];
      } else {
        return vaccineTypes.map((vaccine) => ({
          value: vaccine[0],
          text: vaccine[1].label,
        }));
      }
    } else {
      return vaccineTypes.map((vaccine) => ({
        value: vaccine[0],
        text: vaccine[1].label,
      }));
    }
  };

  useEffect(() => {
    reset({
      patientVaxxed: "first",
      patientName: "",
      patientDOB: null,
      patientMBO: "",
      patientVaccine: "moderna",
      vaccineIdentifier: "",
      patientDate: modal.date,
    });
  }, [modal.date]);

  useEffect(() => {
    renderVaccines();
  }, [patientName]);

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
            Zakažite termin cijepljenja
          </Typography>
          <Divider />
          <FormProvider control={control}>
            <form onSubmit={handleSubmit(handleConfirm)}>
              <CardContent className={classes.modalContent}>
                <SelectInput
                  name="patientVaxxed"
                  label="Pacijent se cijepi: "
                  errors={errors}
                  options={[
                    { value: "first", text: "Prvi put" },
                    { value: "second", text: "Drugi put" },
                  ]}
                />
                {patientVaxxed === "first" ? (
                  <TextInput
                    name="patientName"
                    type="text"
                    label="Puno ime pacijenta"
                    errors={errors}
                  />
                ) : patientVaxxed === "second" ? (
                  <AutocompleteInput
                    value={getValues("patientName")}
                    setValue={setValue}
                    name="patientName"
                    label="Puno ime pacijenta"
                    errors={errors}
                    options={options}
                    loading={false}
                  />
                ) : null}
                {patientVaxxed === "first" ? (
                  <MuiPickersUtilsProvider
                    utils={DateFnsUtils}
                    locale={hrLocale}
                  >
                    <DateInput
                      name="patientDOB"
                      label="Datum rođenja"
                      errors={errors}
                    />
                  </MuiPickersUtilsProvider>
                ) : null}
                {patientVaxxed === "first" ? (
                  <TextInput
                    name="patientMBO"
                    type="text"
                    label="MBO"
                    errors={errors}
                  />
                ) : null}
                <SelectInput
                  name="patientVaccine"
                  label="Vrsta cjepiva: "
                  errors={errors}
                  options={renderVaccines()}
                />
                <TextInput
                  name="vaccineIdentifier"
                  type="text"
                  label="Šifra cjepiva"
                  errors={errors}
                />
                <MuiPickersUtilsProvider utils={DateFnsUtils} locale={hrLocale}>
                  <DateTimeInput
                    name="patientDate"
                    label="Datum cijepljenja"
                    errors={errors}
                  />
                </MuiPickersUtilsProvider>
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
                  Zakaži
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

export default AppointmentModal;
