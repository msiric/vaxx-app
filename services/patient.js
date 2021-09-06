import { targetVaccination } from "../utils/helpers";
import { Event } from "../entities/Event";
import { Patient } from "../entities/Patient";

export const fetchPatients = async ({ doctorId, connection }) => {
  const queryBuilder = await connection
    .getRepository(Patient)
    .createQueryBuilder("patient");
  const foundPatients = await queryBuilder
    .where("patient.doctorId = :doctorId", {
      doctorId,
    })
    .orderBy("patient.created", "ASC")
    .getMany();
  console.log(foundPatients);
  return foundPatients;
};

export const fetchPatient = async ({ patientName, doctorId, connection }) => {
  const queryBuilder = await connection
    .getRepository(Patient)
    .createQueryBuilder("patient");
  const foundPatient = await queryBuilder
    .where("patient.name = :patientName AND patient.doctorId = :doctorId", {
      patientName,
      doctorId,
    })
    .getOne();
  console.log(foundPatient);
  return foundPatient;
};

export const addNewPatient = async ({
  patientId,
  patientName,
  patientDOB,
  patientMBO,
  patientVaxxed,
  patientVaccine,
  patientLink,
  doctorId,
  connection,
}) => {
  const patientTarget = targetVaccination(patientVaccine);
  const savedPatient = await connection
    .createQueryBuilder()
    .insert()
    .into(Patient)
    .values([
      {
        id: patientId,
        name: patientName,
        vaxxed: patientVaxxed,
        target: patientTarget,
        vaccine: patientVaccine,
        dob: patientDOB,
        mbo: patientMBO,
        link: patientLink,
        doctor: doctorId,
      },
    ])
    .returning("*")
    .execute();
  console.log(savedPatient);
  return savedPatient;
};

export const editExistingPatient = async ({
  patientId,
  patientVaxxed,
  doctorId,
  connection,
}) => {
  const updatedPatient = await connection
    .createQueryBuilder()
    .update(Patient)
    .set({ vaxxed: patientVaxxed })
    .where('"id" = :patientId AND "doctorId" = :doctorId', {
      patientId,
      doctorId,
    })
    .returning("*")
    .execute();
  console.log(updatedPatient);
  return updatedPatient;
};

export const updateExistingPatient = async ({
  patientId,
  patientData,
  doctorId,
  connection,
}) => {
  const updatedPatient = await connection
    .createQueryBuilder()
    .update(Patient)
    .set({ ...patientData })
    .where('"id" = :patientId AND "doctorId" = :doctorId', {
      patientId,
      doctorId,
    })
    .returning("*")
    .execute();
  console.log(updatedPatient);
  return updatedPatient;
};

export const removeExistingPatient = async ({
  patientId,
  doctorId,
  connection,
}) => {
  const deletedPatient = await connection
    .createQueryBuilder()
    .delete()
    .from(Patient)
    .where('"id" = :patientId AND "doctorId" = :doctorId', {
      patientId,
      doctorId,
    })
    .execute();
  console.log(deletedPatient);
  return deletedPatient;
};

export const removeUserPatients = async ({ doctorId, connection }) => {
  const deletedPatients = await connection
    .createQueryBuilder()
    .delete()
    .from(Patient)
    .where('"doctorId" = :doctorId', {
      doctorId,
    })
    .execute();
  console.log(deletedPatients);
  return deletedPatients;
};
