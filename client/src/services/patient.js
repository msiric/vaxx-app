import { ax } from "../Interceptor.js";

export const getPatients = {
  request: async () => await ax.get("/api/patients"),
  success: { message: "Pacijenti uspješno dohvaćeni", variant: "success" },
  error: { message: "Greška prilikom dohvaćanja pacijenata", variant: "error" },
};
export const patchPatient = {
  request: async ({ patientId, data }) =>
    await ax.patch(`/api/patients/${patientId}`, data),
  success: { message: "Pacijent uspješno izmijenjen", variant: "success" },
  error: { message: "Greška prilikom izmjene pacijenta", variant: "error" },
};
