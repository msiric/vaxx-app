import createError from 'http-errors';
import { fetchPatients, updateExistingPatient } from '../services/patient';

export const getPatients = async ({ userId, connection }) => {
  const foundPatients = await fetchPatients({ doctorId: userId, connection });
  return { patients: foundPatients };
};

export const patchPatient = async ({
  patientId,
  patientData,
  userId,
  connection,
}) => {
  const permitted = ['name', 'dob', 'mbo'];
  if (!patientData || Object.keys(patientData).some(key => !permitted.includes(key))) {
    throw createError(400, 'Invalid patient fields');
  }
  if (patientData.name !== undefined && (typeof patientData.name !== 'string' || patientData.name.length < 5 || patientData.name.length > 80)) throw createError(400, 'Invalid name');
  if (patientData.mbo !== undefined && (typeof patientData.mbo !== 'string' || patientData.mbo.length !== 9)) throw createError(400, 'Invalid identifier');
  if (patientData.dob !== undefined && !Number.isFinite(Date.parse(patientData.dob))) throw createError(400, 'Invalid date');
  const result = await updateExistingPatient({
    patientId,
    patientData,
    doctorId: userId,
    connection,
  });
  if (!result.affected) throw createError(404, "Patient not found");
  return { message: "Patient updated successfully" };
};
