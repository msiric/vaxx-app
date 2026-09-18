import createError from 'http-errors';
import { fetchSpecifiedEvents } from '../services/event';
import { fetchPatients } from '../services/patient';

export const getAll = async ({ userId, rangeFrom, rangeTo, connection }) => {
  for (const value of [rangeFrom, rangeTo]) {
    if (value !== undefined && (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)))) throw createError(400, 'Invalid date range');
  }
  const foundPatients = await fetchPatients({ doctorId: userId, connection });
  const foundEvents = await fetchSpecifiedEvents({
    doctorId: userId,
    rangeFrom,
    rangeTo,
    connection,
  });
  const result = [];
  for (let patient of foundPatients) {
    const events = foundEvents.filter((event) => event.link === patient.link);
    if (events.length) {
      result.push({ ...patient, events });
    }
  }

  const formatted = [];
  result.forEach((item) => {
    formatted.push({
      name: item.name,
      vaxxed: item.vaxxed === "first" ? 1 : 2,
      vaccine: item.vaccine,
      dob: item.dob,
      mbo: item.mbo,
      events: item.events.map((event) => ({
        date: event.date,
        event: event.type === "first" ? "prvi" : "drugi",
        identifier: event.identifier,
      })),
    });
  });
  return formatted;
};
