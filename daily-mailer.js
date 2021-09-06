import { createConnection } from "typeorm";
import cron from "node-cron";
import { fetchSelectedEvents } from "./services/event";
import { sendEmail } from "./utils/email";
import { isArrayEmpty } from "./common/helpers";
import { fetchUsers } from "./services/user";
import { postgres } from "./config/secret.js";
import path from "path";
import { add } from "date-fns";
import { vaccines } from "./common/constants";

/* const job = new CronJob("0 0 9 * * *", async () => {

}); */

const notifyUser = async () => {
  const connection = await createConnection({
    type: "postgres",
    url: postgres.database,
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [path.join(__dirname, "./entities/*")],
    ssl: {
      rejectUnauthorized: false,
    },
  });
  const newDate = new Date();
  const patientDate = add(newDate.setHours(1, 0, 0, 0), { days: 1 });
  const foundUsers = await fetchUsers({ connection });
  for (let user of foundUsers) {
    if (user.reminders === "enabled") {
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
  }
};
notifyUser();
