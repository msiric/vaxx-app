import { connectDatabase } from "./config/database";

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
  if (process.env.DEMO_MODE === 'true') throw new Error('Demo reminders are previews in /api/demo/outbox; no email is sent.');
  const connection = await connectDatabase();
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
notifyUser().catch(() => { console.error("Reminder job failed"); process.exitCode = 1; });
