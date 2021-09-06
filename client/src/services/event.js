import { ax } from "../Interceptor.js";

export const getEvents = {
  request: async () => await ax.get("/api/events"),
  success: { message: "Termini uspješno dohvaćeni", variant: "success" },
  error: { message: "Greška prilikom dohvaćanja termina", variant: "error" },
};
export const postEvent = {
  request: async ({ data }) => await ax.post("/api/events", data),
  success: { message: "Termin uspješno zakazan", variant: "success" },
  error: { message: "Greška prilikom stvaranja termina", variant: "error" },
};
export const patchEvent = {
  request: async ({ eventId, data }) =>
    await ax.patch(`/api/events/${eventId}`, data),
  success: { message: "Termin uspješno izmijenjen", variant: "success" },
  error: { message: "Greška prilikom izmjene termina", variant: "error" },
};
export const deleteEvent = {
  request: async ({ eventId }) => await ax.delete(`/api/events/${eventId}`),
  success: { message: "Termin uspješno uklonjen", variant: "success" },
  error: { message: "Greška prilikom uklanjanja termina", variant: "error" },
};
