import argon2 from "argon2";
import crypto from "crypto";
import createError from "http-errors";
import { fetchPatient, removeExistingPatient } from "../services/patient";
import { global } from "../common/constants";
import { isArrayEmpty, isObjectEmpty } from "../common/helpers";
import {
  emailValidation,
  eventValidation,
  loginValidation,
  passwordValidation,
  recoveryValidation,
  signupValidation,
} from "../common/validation";
import {
  fetchEvents,
  addNewEvent,
  removeExistingEvent,
  fetchExistingEvent,
  fetchExistingEvents,
  fetchSelectedEvents,
  editExistingEvent,
  fetchPreviousEvent,
} from "../services/event.js";
import { addNewPatient, editExistingPatient } from "../services/patient.js";
import {
  editUserEmail,
  fetchUserByAuth,
  fetchUserByEmail,
  fetchUserByResetToken,
  fetchUserIdByCreds,
  fetchUserIdByEmail,
  fetchUserIdByUsername,
  fetchUserIdByVerificationToken,
  fetchUsers,
} from "../services/user.js";
import {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
} from "../utils/auth.js";
import { sendEmail } from "../utils/email.js";
import { generateUuids, sanitizeData } from "../utils/helpers.js";
import { add, isBefore } from "date-fns";
import { sendEmail } from "../utils/email";
import { vaccines } from "../common/constants";

export const getEvents = async ({ userId, connection }) => {
  const foundEvents = await fetchEvents({ doctorId: userId, connection });
  return { events: foundEvents };
};

export const getSelectedEvents = async ({ userId, connection }) => {
  const newDate = new Date();
  const patientDate = add(newDate.setHours(1, 0, 0, 0), { days: 1 });
  const foundUsers = await fetchUsers({ connection });
  for (let user of foundUsers) {
    const foundEvents = await fetchSelectedEvents({
      patientDate,
      doctorId: user.id,
      connection,
    });
    const emailBody = isArrayEmpty(foundEvents)
      ? "Nemate pacijenata koji bi sutra trebali dobiti drugu dozu cjepiva."
      : `Pacijenti koji sutra trebaju dobiti drugu dozu cjepiva su:
            ${foundEvents.map(
              (event) =>
                ` ${event.patient.name}: ${
                  vaccines[event.patient.vaccine].label
                }`
            )}    
        `;
    await sendEmail({
      emailReceiver: user.email,
      emailSubject: "Lista pacijenata",
      emailContent: emailBody,
    });
  }
};

export const postEvent = async ({
  patientVaxxed,
  patientName,
  patientDOB,
  patientMBO,
  patientVaccine,
  vaccineIdentifier,
  patientDate,
  userId,
  connection,
}) => {
  await eventValidation.validate(
    sanitizeData({
      patientVaxxed,
      patientName,
      patientDOB,
      patientMBO,
      patientVaccine,
      vaccineIdentifier,
      patientDate,
    })
  );
  if (patientVaxxed === "first") {
    const [foundPatient, foundEvents] = await Promise.all([
      fetchPatient({
        patientName,
        doctorId: userId,
        connection,
      }),
      fetchExistingEvents({
        patientDate,
        doctorId: userId,
        connection,
      }),
    ]);
    if (!isObjectEmpty(foundPatient)) {
      throw createError(400, "Pacijent već postoji u bazi");
    }
    if (!isArrayEmpty(foundEvents)) {
      throw createError(400, "Već postoje termini u odabranom vremenu");
    }
    const { patientId, eventId, eventsLink } = generateUuids({
      patientId: null,
      eventId: null,
      eventsLink: null,
    });
    const [savedPatient, savedEvent] = await Promise.all([
      addNewPatient({
        patientId,
        patientName,
        patientDOB,
        patientMBO,
        patientVaxxed,
        patientVaccine,
        patientLink: eventsLink,
        doctorId: userId,
        connection,
      }),
      addNewEvent({
        eventId,
        patientId,
        patientDate,
        patientLink: eventsLink,
        patientType: "first",
        doctorId: userId,
        vaccineIdentifier,
        connection,
      }),
    ]);
    return {
      message: "Termin uspješno kreiran",
      payload: { patient: savedPatient.raw[0], event: savedEvent.raw[0] },
    };
  } else if (patientVaxxed === "second") {
    const [foundPatient, foundEvents] = await Promise.all([
      fetchPatient({
        patientName,
        doctorId: userId,
        connection,
      }),
      fetchExistingEvents({
        patientDate,
        doctorId: userId,
        connection,
      }),
    ]);
    if (isObjectEmpty(foundPatient)) {
      throw createError(400, "Pacijent nije pronađen u bazi");
    }
    if (foundPatient.target === "first") {
      throw createError(400, "Pacijentu nije potrebna druga doza cjepiva");
    }
    if (foundPatient.vaxxed === "second") {
      throw createError(400, "Pacijent je već zakazan za drugu dozu cjepiva");
    }
    if (foundPatient.vaccine !== patientVaccine) {
      throw createError(
        400,
        "Odabrano cjepivo se razlikuje od prethodno korištenog za pacijenta"
      );
    }
    if (!isArrayEmpty(foundEvents)) {
      throw createError(400, "Već postoje termini u odabranom vremenu");
    }
    const foundEvent = await fetchPreviousEvent({
      patientLink: foundPatient.link,
      doctorId: userId,
      connection,
    });
    if (isObjectEmpty(foundEvent)) {
      throw createError(400, "Prethodni termin nije pronađen");
    }
    if (isBefore(new Date(patientDate), new Date(foundEvent.date))) {
      throw createError(
        400,
        "Drugi termin cijepljenja ne može biti prije prvog"
      );
    }
    const { eventId } = generateUuids({
      eventId: null,
    });
    const savedPatient = await editExistingPatient({
      patientId: foundPatient.id,
      patientVaxxed,
      doctorId: userId,
      connection,
    });
    const savedEvent = await addNewEvent({
      eventId,
      patientId: foundPatient.id,
      patientDate,
      patientLink: foundPatient.link,
      patientType: "second",
      doctorId: userId,
      vaccineIdentifier,
      connection,
    });
    return {
      message: "Termin uspješno kreiran",
      payload: { patient: savedPatient.raw[0], event: savedEvent.raw[0] },
    };
  }
  throw createError(400, "Netočno uneseni podatci");
};

export const patchEvent = async ({
  eventId,
  eventData,
  userId,
  connection,
}) => {
  await editExistingEvent({
    eventId,
    eventData,
    doctorId: userId,
    connection,
  });
  return { message: "Event updated successfully" };
};

export const deleteEvent = async ({ eventId, userId, connection }) => {
  const foundEvent = await fetchExistingEvent({
    eventId,
    doctorId: userId,
    connection,
  });
  if (isObjectEmpty(foundEvent)) {
    throw createError(400, "Termin nije pronađen");
  }
  let deleted = false;
  await removeExistingEvent({
    eventId,
    doctorId: userId,
    connection,
  });
  if (foundEvent.patient.vaxxed === "first") {
    await removeExistingPatient({
      patientId: foundEvent.patient.id,
      doctorId: userId,
      connection,
    });
    deleted = true;
  } else if (foundEvent.patient.vaxxed === "second") {
    const foundPreviousEvent = await fetchPreviousEvent({
      patientLink: foundEvent.link,
      doctorId: userId,
      connection,
    });
    if (!isObjectEmpty(foundPreviousEvent)) {
      await editExistingPatient({
        patientId: foundEvent.patient.id,
        patientVaxxed: "first",
        doctorId: userId,
        connection,
      });
    } else {
      if (foundEvent.type === "second") {
        await removeExistingPatient({
          patientId: foundEvent.patient.id,
          doctorId: userId,
          connection,
        });
        deleted = true;
      }
    }
  }
  return {
    message: "Termin uspješno uklonjen",
    payload: { patient: deleted ? foundEvent.patient.id : null },
  };
};
