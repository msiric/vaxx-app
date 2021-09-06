import React, { useEffect, useState } from "react";
import {
  Backdrop,
  Button,
  Divider,
  Fade,
  makeStyles,
  Modal,
  CardActions,
  CardContent,
  Typography,
  Card,
  TextField,
} from "@material-ui/core";
import { getAll } from "../../services/all.js";
import LoadingSpinner from "../LoadingSpinner/index.js";
import { vaccines } from "../../../../common/constants.js";
import { format } from "date-fns";

const useStyles = makeStyles((muiTheme) => ({
  modalWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  modalContainer: {
    backgroundColor: muiTheme.palette.background.paper,
    boxShadow: muiTheme.shadows[5],
    padding: muiTheme.spacing(2),
    borderRadius: muiTheme.spacing(0.5),
    maxWidth: 1200,
    width: "100%",
    height: "auto",
    maxHeight: "90%",
    margin: "0 16px",
    overflowY: "scroll",
  },
  modalTitle: {
    paddingBottom: muiTheme.spacing(2),
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    padding: 0,
  },
  listTable: {
    width: "100%",
    textAlign: "center",
  },
  eventTable: {
    width: "100%",
    textAlign: "center",
  },
  tableHeading: {
    background: "#ebedef",
  },
  tableRow: {
    "&:nth-child(odd)": {
      background: "#fbfbfb",
    },
    "&:nth-child(even)": {
      background: "#ebedef",
    },
  },
  eventDivider: {
    display: "none",
  },
  tableBody: {
    minHeight: 50,
    display: "flex",
  },
  noResults: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    marginTop: 30,
  },
  tableWrapper: {
    paddingRight: 0,
    paddingLeft: 0,
  },
  [muiTheme.breakpoints.down(1000)]: {
    tableHeading: {
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      width: 1,
    },
    tableRow: {
      display: "block",
      marginBottom: "0.625em",
      padding: 4,
    },
    tableData: {
      display: "block",
      textAlign: "right",
      "&:before": {
        content: "attr(data-label)",
        float: "left",
        fontWeight: "bold",
      },
    },
    eventHeading: {
      display: "none",
    },
    eventTable: {
      padding: "8px 16px",
    },
    eventRow: {
      borderBottom: "3px solid",
    },
    eventDivider: {
      display: "block",
    },
  },
}));

const ListModal = ({
  modal,
  handleToggleModal,
  handleLoadingModal,
  handleSetList,
}) => {
  const [results, setResults] = useState([]);
  const classes = useStyles();

  const handleSearchChange = (event) => {
    const query = event.target.value;
    if (query) {
      const foundResults = modal.data.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setResults(foundResults);
    } else {
      setResults(modal.data);
    }
  };

  const fetchList = async () => {
    handleLoadingModal();
    const { data } = await getAll.request();
    handleSetList(data);
    setResults(data);
  };

  useEffect(() => {
    if (modal.open) {
      fetchList();
    }
  }, [modal.open]);

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
        <Card className={classes.modalContainer}>
          <Typography className={classes.modalTitle}>
            Lista pacijenata
          </Typography>
          <Divider />
          <TextField
            type="text"
            label="Pretraži listu"
            onChange={handleSearchChange}
            margin="dense"
            variant="outlined"
            className={classes.searchInput}
            fullWidth
          />
          <CardContent className={classes.tableWrapper}>
            {modal.loading ? (
              <LoadingSpinner />
            ) : (
              <table className={classes.listTable}>
                <thead>
                  <tr className={classes.tableHeading}>
                    <th>Ime</th>
                    <th>Broj doza</th>
                    <th>Cjepivo</th>
                    <th>Datum rođenja</th>
                    <th>MBO</th>
                    <th>Termini cijepljenja</th>
                  </tr>
                </thead>
                <tbody className={!results.length ? classes.tableBody : ""}>
                  {results.length ? (
                    results.map((item) => (
                      <tr className={classes.tableRow}>
                        <td className={classes.tableData} data-label="Ime">
                          {item.name}
                        </td>
                        <td
                          className={classes.tableData}
                          data-label="Broj doza"
                        >
                          {item.vaxxed}
                        </td>
                        <td className={classes.tableData} data-label="Cjepivo">
                          {vaccines[item.vaccine].label}
                        </td>
                        <td
                          className={classes.tableData}
                          data-label="Datum rođenja"
                        >
                          {format(new Date(item.dob), "dd/MM/yyyy")}
                        </td>
                        <td className={classes.tableData} data-label="MBO">
                          {item.mbo}
                        </td>
                        <td
                          className={classes.tableData}
                          data-label="Termini cijepljenja"
                        >
                          <table className={classes.eventTable}>
                            <thead>
                              <tr
                                className={`${classes.eventRow} ${classes.eventHeading}`}
                              >
                                <th>Datum</th>
                                <th>Šifra cjepiva</th>
                                <th>Termin</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.events.map((event, index) => (
                                <>
                                  {index % 2 !== 0 && (
                                    <Divider className={classes.eventDivider} />
                                  )}
                                  <tr className={classes.eventRow}>
                                    <td
                                      className={classes.tableData}
                                      data-label="Datum"
                                    >
                                      {format(
                                        new Date(event.date),
                                        "dd/MM/yyyy HH:mm"
                                      )}
                                    </td>
                                    <td
                                      className={classes.tableData}
                                      data-label="Šifra cjepiva"
                                    >
                                      {event.identifier}
                                    </td>
                                    <td
                                      className={classes.tableData}
                                      data-label="Termin"
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {event.event}
                                    </td>
                                  </tr>
                                </>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <div className={classes.noResults}>
                      Nema rezultata pretrage
                    </div>
                  )}
                </tbody>
              </table>
            )}
          </CardContent>
          <CardActions className={classes.modalActions}>
            <Button
              type="button"
              variant="outlined"
              color="dark"
              onClick={handleToggleModal}
            >
              Zatvori
            </Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
};

export default ListModal;
