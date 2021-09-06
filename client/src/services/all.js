import { ax } from "../Interceptor.js";

export const getAll = {
  request: async () => await ax.get("/api/all"),
  success: { message: "Lista uspješno dohvaćena", variant: "success" },
  error: { message: "Greška prilikom dohvaćanja liste", variant: "error" },
};
