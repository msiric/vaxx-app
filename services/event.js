import { Event } from "../entities/Event";
import { upload } from "../../common/constants";
import { subMinutes, subDays, formatISO, addMinutes } from "date-fns";

export const fetchEvents = async ({ doctorId, connection }) => {
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvents = await queryBuilder
    .leftJoinAndSelect("event.patient", "patient")
    .where("event.doctorId = :doctorId", {
      doctorId,
    })
    .orderBy("event.created", "ASC")
    .getMany();
  console.log(foundEvents);
  return foundEvents;
};

export const fetchSpecifiedEvents = async ({
  doctorId,
  rangeFrom,
  rangeTo,
  connection,
}) => {
  const dateFrom = rangeFrom
    ? new Date(`${rangeFrom} 00:00:01`).toISOString()
    : new Date("01/01/1970").toISOString();
  const dateTo = rangeTo
    ? new Date(`${rangeTo} 23:59:59`).toISOString()
    : new Date(86400000000000).toISOString();
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvents = await queryBuilder
    .where(
      "event.date <= :dateTo AND event.date >= :dateFrom AND event.doctorId = :doctorId",
      {
        dateTo,
        dateFrom,
        doctorId,
      }
    )
    .orderBy("event.date", "ASC")
    .getMany();
  console.log(foundEvents);
  return foundEvents;
};

export const addNewEvent = async ({
  eventId,
  patientId,
  patientDate,
  patientType,
  patientLink,
  doctorId,
  vaccineIdentifier,
  connection,
}) => {
  const savedEvent = await connection
    .createQueryBuilder()
    .insert()
    .into(Event)
    .values([
      {
        id: eventId,
        patient: patientId,
        date: new Date(patientDate).toISOString(),
        type: patientType,
        link: patientLink,
        doctor: doctorId,
        identifier: vaccineIdentifier,
      },
    ])
    .returning("*")
    .execute();
  console.log(savedEvent);
  return savedEvent;
};

export const editExistingEvent = async ({
  eventId,
  eventData,
  doctorId,
  connection,
}) => {
  const updatedEvent = await connection
    .createQueryBuilder()
    .update(Event)
    .set({ ...eventData })
    .where('id = :eventId AND "doctorId" = :doctorId', {
      eventId,
      doctorId,
    })
    .execute();
  console.log(updatedEvent);
  return updatedEvent;
};

export const removeExistingEvent = async ({
  eventId,
  doctorId,
  connection,
}) => {
  const deletedEvent = await connection
    .createQueryBuilder()
    .delete()
    .from(Event)
    .where('"id" = :eventId AND "doctorId" = :doctorId', {
      eventId,
      doctorId,
    })
    .execute();
  console.log(deletedEvent);
  return deletedEvent;
};

export const removeUserEvents = async ({ doctorId, connection }) => {
  const deletedEvents = await connection
    .createQueryBuilder()
    .delete()
    .from(Event)
    .where('"doctorId" = :doctorId', {
      doctorId,
    })
    .execute();
  console.log(deletedEvents);
  return deletedEvents;
};

export const fetchExistingEvent = async ({ eventId, doctorId, connection }) => {
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvent = await queryBuilder
    .leftJoinAndSelect("event.patient", "patient")
    .where("event.id = :eventId AND event.doctorId = :doctorId", {
      eventId,
      doctorId,
    })
    .getOne();
  console.log(foundEvent);
  return foundEvent;
};

export const fetchExistingEvents = async ({
  patientDate,
  doctorId,
  connection,
}) => {
  const previousDate = {
    max: new Date(patientDate).toISOString(),
    min: subMinutes(new Date(patientDate), 15).toISOString(),
  };
  const nextDate = {
    max: addMinutes(new Date(patientDate), 15).toISOString(),
    min: new Date(patientDate).toISOString(),
  };
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvents = await queryBuilder
    .leftJoinAndSelect("event.patient", "patient")
    .where(
      "(event.date <= :prevMax AND event.date > :prevMin AND event.doctorId = :doctorId) OR (event.date < :nextMax AND event.date >= :nextMin AND event.doctorId = :doctorId)",
      {
        prevMax: previousDate.max,
        prevMin: previousDate.min,
        nextMax: nextDate.max,
        nextMin: nextDate.min,
        doctorId,
      }
    )
    .orderBy("event.date", "ASC")
    .getMany();
  console.log(foundEvents);
  return foundEvents;
};

export const fetchSelectedEvents = async ({
  patientDate,
  doctorId,
  connection,
}) => {
  const modernaDate = {
    from: subDays(new Date(patientDate), 28).toISOString(),
    to: subDays(new Date(patientDate), 27).toISOString(),
  };
  const astraZenecaDate = {
    from: subDays(new Date(patientDate), 56).toISOString(),
    to: subDays(new Date(patientDate), 55).toISOString(),
  };
  const pfizerDate = {
    from: subDays(new Date(patientDate), 21).toISOString(),
    to: subDays(new Date(patientDate), 20).toISOString(),
  };
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvents = await queryBuilder
    .leftJoinAndSelect("event.patient", "patient")
    .where(
      "(event.date > :modernaFrom AND event.date < :modernaTo AND event.type = :eventType AND patient.vaccine = :modernaVax AND event.doctorId = :doctorId) OR (event.date > :astraZenecaFrom AND event.date < :astraZenecaTo AND event.type = :eventType AND patient.vaccine = :astraZenecaVax AND event.doctorId = :doctorId) OR (event.date > :pfizerFrom AND event.date < :pfizerTo AND event.type = :eventType AND patient.vaccine = :pfizerVax AND event.doctorId = :doctorId)",
      {
        modernaFrom: modernaDate.from,
        modernaTo: modernaDate.to,
        astraZenecaFrom: astraZenecaDate.from,
        astraZenecaTo: astraZenecaDate.to,
        pfizerFrom: pfizerDate.from,
        pfizerTo: pfizerDate.to,
        modernaVax: "moderna",
        astraZenecaVax: "astrazeneca",
        pfizerVax: "pfizer",
        eventType: "first",
        doctorId,
      }
    )
    .orderBy("event.date", "ASC")
    .getMany();
  console.log(foundEvents);
  return foundEvents;
};

export const fetchPreviousEvent = async ({
  patientLink,
  doctorId,
  connection,
}) => {
  const queryBuilder = await connection
    .getRepository(Event)
    .createQueryBuilder("event");
  const foundEvents = await queryBuilder
    .leftJoinAndSelect("event.patient", "patient")
    .where(
      "event.link = :patientLink AND event.type = :eventType AND event.doctorId = :doctorId",
      {
        patientLink,
        eventType: "first",
        doctorId,
      }
    )
    .getOne();
  console.log(foundEvents);
  return foundEvents;
};
