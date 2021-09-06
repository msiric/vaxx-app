import { Button, Grid, ListItemIcon, Typography } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import AppointmentModal from "../components/AppointmentModal/index.js";
import DeleteModal from "../components/DeleteModal/index.js";
import { getEvents, patchEvent } from "../services/event.js";
import { getPatients, patchPatient } from "../services/patient.js";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import { postLogout } from "../services/auth.js";
import { useUserStore } from "../contexts/user.js";
import { vaccines } from "../../../common/constants";
import { addMinutes, format, isAfter } from "date-fns";
import { useRef } from "react";
import ListModal from "../components/ListModal/index.js";
import SettingsModal from "../components/SettingsModal/index.js";
import DeactivateModal from "../components/DeactivateModal/index.js";

const useStyles = makeStyles((muiTheme) => ({
  backdrop: {
    zIndex: muiTheme.zIndex.drawer + 1,
    color: "#fff",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    backgroundColor: "#ebedef",
    padding: "0 20px",
    borderRadius: "15px",
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
  },
  userInfo: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  userName: {
    marginRight: "20px",
    fontWeight: "bold",
  },
  heading: {
    fontSize: 48,
    margin: "0",
  },
  vaccineContainer: {
    margin: "0 0 20px 0",
  },
  vaccineType: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  modernaVaccine: {
    height: 10,
    width: 10,
    borderRadius: "50%",
    backgroundColor: "#EB0524",
  },
  astraZenecaVaccine: {
    height: 10,
    width: 10,
    borderRadius: "50%",
    backgroundColor: "#740F5A",
  },
  vaccineLabel: {
    fontSize: 20,
    fontWeight: "bold",
    margin: "0 0 0 15px",
  },
  headerContent: {
    display: "block",
    [muiTheme.breakpoints.up(599)]: {
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
  },
  toolbarContent: {
    display: "flex",
    justifyContent: "space-between",
    [muiTheme.breakpoints.down(400)]: {
      flexDirection: "column",
    },
  },
  toolbarButtons: {
    margin: "12px 0 12px 6px",
    [muiTheme.breakpoints.down(600)]: {
      margin: 0,
      width: "100%",
      "&:nth-child(odd)": {
        marginRight: "6px",
      },
      "&:nth-child(even)": {
        marginLeft: "6px",
      },
    },
    [muiTheme.breakpoints.down(400)]: {
      margin: "6px 0",
      "&:nth-child(odd)": {
        marginRight: 0,
      },
      "&:nth-child(even)": {
        marginLeft: 0,
      },
    },
  },
  "@global": {
    ".fc-media-screen": {
      marginBottom: "32px !important",
    },
    ".fc-daygrid-event.fc-event-end": {
      whiteSpace: "initial !important",
    },
    ".fc-header-toolbar.fc-toolbar": {
      [muiTheme.breakpoints.down(600)]: {
        display: "block !important",
        margin: "0 auto 1.5em auto !important",
      },
    },
    ".fc-toolbar-chunk": {
      [muiTheme.breakpoints.down(600)]: {
        textAlign: "center",
      },
      "&:first-of-type": {
        [muiTheme.breakpoints.down(600)]: {
          marginBottom: "10px",
        },
      },
    },
    ".fc-no-events": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "6px",
      textAlign: "center",
    },
  },
}));

const DATES = {};
const MOBILE_BREAKPOINT = 765;
const formatDate = (date, form = "dd/MM/yyyy") => format(new Date(date), form);

const Home = () => {
  const name = useUserStore((state) => state.name);
  const resetUser = useUserStore((state) => state.resetUser);

  const [events, setEvents] = useState([]);
  const [patients, setPatients] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    add: {
      open: false,
      date: null,
    },
    delete: {
      open: false,
      title: null,
      id: null,
      date: null,
    },
    settings: {
      open: false,
    },
    deactivate: {
      open: false,
    },
    list: {
      open: false,
      data: [],
      initialized: false,
      loading: false,
    },
  });
  const currentDate = useRef();
  const calendarRef = useRef();

  const classes = useStyles();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [events, patients] = await Promise.all([
        getEvents.request(),
        getPatients.request(),
      ]);
      const formattedEvents = events.data.events.map((event) => {
        evaluateNewestDate(event.date);
        return {
          title: `${event.patient.name} - ${
            event.type === "first" ? "Prva doza" : "Druga doza"
          }`,
          id: event.id,
          patientId: event.patient.id,
          date: event.date,
          dob: event.patient.dob,
          mbo: event.patient.mbo,
          vaccine: event.patient.vaccine,
          identifier: event.identifier,
          specifiedDate: event.date,
          editable: true,
          backgroundColor: `${vaccines[event.patient.vaccine].color}`,
        };
      });
      setEvents(formattedEvents);
      setPatients(patients.data.patients);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await postLogout.request();
      resetUser();
      window.location.href = "/login";
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddClose = () =>
    setModal((prevState) => ({
      ...prevState,
      add: { open: false, date: null },
    }));

  const handleDeleteClose = () =>
    setModal((prevState) => ({
      ...prevState,
      delete: { open: false, title: null, id: null, date: null },
    }));

  const handleSettingsToggle = () =>
    setModal((prevState) => ({
      ...prevState,
      settings: { open: !prevState.settings.open },
    }));

  const handleDeactivationToggle = () => {
    setModal((prevState) => ({
      ...prevState,
      deactivate: { open: !prevState.deactivate.open },
    }));
  };

  const handleListToggle = () =>
    setModal((prevState) => ({
      ...prevState,
      list: { ...prevState.list, open: !prevState.list.open },
    }));

  const handleLoadingModal = () => {
    setModal((prevState) => ({
      ...prevState,
      list: { ...prevState.list, loading: !prevState.list.loading },
    }));
  };

  const handleSetList = (data) => {
    setModal((prevState) => ({
      ...prevState,
      list: { ...prevState.list, data, loading: false, initialized: true },
    }));
  };

  const handleDateClick = (event) => {
    setModal((prevState) => ({
      ...prevState,
      add: {
        open: true,
        date: DATES[formatDate(event.date)]
          ? addMinutes(new Date(DATES[formatDate(event.date)]), 15)
          : new Date(new Date(event.date.setHours(8, 0, 0, 0))),
      },
    }));
  };

  const handleEventClick = (event) => {
    setModal((prevState) => ({
      ...prevState,
      delete: {
        open: true,
        title: `${event.event._def.title} (${
          vaccines[event.event._def.extendedProps.vaccine].label
        })`,
        dob: `Datum rođenja: ${formatDate(event.event._def.extendedProps.dob)}`,
        mbo: `MBO: ${event.event._def.extendedProps.mbo}`,
        identifier: `Šifra cjepiva: ${event.event._def.extendedProps.identifier}`,
        appointment: `Termin: ${formatDate(
          event.event._def.extendedProps.specifiedDate,
          "dd/MM/yyyy HH:mm"
        )}`,
        date: event.event._def.extendedProps.specifiedDate,
        id: event.event._def.publicId,
        patient: event.event._def.extendedProps.patientId,
      },
    }));
  };

  const handleMobile = () => {
    const listDays = document.querySelectorAll(".fc-list-day");
    const noEvents = document.querySelector(".fc-no-events");
    if (noEvents)
      noEvents.onclick = () => handleDateClick({ date: currentDate.current });
    if (listDays.length) {
      listDays.forEach((listDay) => {
        listDay.onclick = (event) => {
          const date = event.path.find((item) =>
            item.className.includes("fc-list-day fc-day")
          ).dataset.date;
          handleDateClick({ date: new Date(date) });
        };
      });
    }
  };

  const evaluateNewestDate = (date) => {
    const currentDate = formatDate(date);
    if (!DATES[currentDate]) {
      DATES[currentDate] = new Date(date);
    } else if (isAfter(new Date(date), new Date(DATES[currentDate]))) {
      DATES[currentDate] = new Date(date);
    }
  };

  const setAvailableSlot = (date) => {
    const currentDate = formatDate(date);
    DATES[currentDate] = new Date(date);
  };

  /*   const patchEvents = async () => {
    for (let event of eventsData) {
      await patchEvent.request({
        eventId: event.id,
        data: { identifier: event.identifier },
      });
    }
  };

  const patchPatients = async () => {
    for (let patient of patientsData) {
      await patchPatient.request({
        patientId: patient.id,
        data: { dob: new Date(patient.dob), mbo: patient.mbo },
      });
    }
  }; */

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const formattedPatients = patients
      .filter(
        (patient) =>
          patient.target === "second" && patient.target !== patient.vaxxed
      )
      .map((patient) => ({
        text: patient.name,
        value: patient.name,
      }));
    setOptions(formattedPatients);
  }, [patients]);

  return (
    <Grid container style={{ width: "100%", margin: 0, padding: "0 16px" }}>
      <Grid item xs={12} style={{ marginTop: 32 }}>
        <Backdrop className={classes.backdrop} open={loading}>
          <CircularProgress color="inherit" />
        </Backdrop>
        <div className={classes.userInfo}>
          <Typography className={classes.userName}>{name}</Typography>
        </div>
        <div className={classes.header}>
          <h1 className={classes.heading}>Vaxx</h1>
          <div className={classes.headerActions}>
            <Button variant="outlined" onClick={handleLogout}>
              Odjava
            </Button>
          </div>
        </div>
        <div className={classes.headerContent}>
          <div className={classes.vaccineContainer}>
            {Object.values(vaccines).map((vaccine) => (
              <div className={classes.vaccineType}>
                <div
                  style={{
                    height: 10,
                    width: 10,
                    borderRadius: "50%",
                    backgroundColor: vaccine.color,
                  }}
                ></div>
                <p className={classes.vaccineLabel}>{vaccine.label}</p>
              </div>
            ))}
          </div>
          <div className={classes.toolbarContent}>
            <Button
              variant="outlined"
              onClick={handleListToggle}
              className={classes.toolbarButtons}
            >
              Lista
            </Button>
            <Button
              variant="outlined"
              onClick={handleSettingsToggle}
              className={classes.toolbarButtons}
            >
              Postavke
            </Button>
          </div>
        </div>
        <FullCalendar
          plugins={[
            dayGridPlugin,
            listPlugin,
            timeGridPlugin,
            interactionPlugin,
          ]}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          initialView={
            window.innerWidth < MOBILE_BREAKPOINT ? "listWeek" : "dayGridMonth"
          }
          locale="hr"
          firstDay="1"
          events={events}
          buttonText={{
            today: "Danas",
            month: "Mjesec",
            week: "Tjedan",
            day: "Dan",
            list: "Lista",
          }}
          displayEventTime={true}
          displayEventEnd={true}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          windowResize={() => {
            if (window.innerWidth < 765) {
              calendarRef.current.getApi().changeView("listWeek");
              handleMobile();
            } else {
              calendarRef.current.getApi().changeView("dayGridMonth");
            }
          }}
          datesSet={(arg) => {
            currentDate.current = arg.start;
            if (window.innerWidth < MOBILE_BREAKPOINT) handleMobile();
          }}
          eventsSet={(arg) => {
            if (window.innerWidth < MOBILE_BREAKPOINT) handleMobile();
          }}
          contentHeight="auto"
          handleWindowResize={true}
          noEventsClassNames="fc-no-events"
          noEventsContent="Nema zakazanih termina u odabranom danu"
          droppable={false}
          editable={false}
          eventAllow={() => null}
          ref={calendarRef}
        />
        <SettingsModal
          modal={modal.settings}
          shouldHide={modal.deactivate.open}
          handleToggleModal={handleSettingsToggle}
          handleActionModal={handleDeactivationToggle}
        />
        <AppointmentModal
          modal={modal.add}
          patients={patients}
          options={options}
          setEvents={setEvents}
          setPatients={setPatients}
          setOptions={setOptions}
          evaluateNewestDate={evaluateNewestDate}
          handleToggleModal={handleAddClose}
        />
        <DeleteModal
          modal={modal.delete}
          setEvents={setEvents}
          setPatients={setPatients}
          setAvailableSlot={setAvailableSlot}
          handleToggleModal={handleDeleteClose}
        />
        <DeactivateModal
          modal={modal.deactivate}
          handleToggleModal={handleDeactivationToggle}
        />
        <ListModal
          modal={modal.list}
          handleToggleModal={handleListToggle}
          handleLoadingModal={handleLoadingModal}
          handleSetList={handleSetList}
        />
      </Grid>
    </Grid>
  );
};

export default Home;
