# Vaxx Application

A weekend project created as a helper tool for healthcare workers.

You can access the application here: [Demo](https://vaxx-app.herokuapp.com/)

The application came to life after seeing the struggle that healthcare workers face while dealing with the COVID-19 pandemic in Croatia.
The existing software they used wasn't equipped to deal with the influx of patients wanting to get vaccinated and there was no way to keep things organized.

## Features

Vaxx allows healthcare workers to register and save vaccination dates for their patients. 
Currently, four vaccines are supported: Moderna, Pfizer, AstraZeneca and Johnson & Johnson.
There is validation in place to aid the workers when entering new events or saving patient data.
Additionally, intervals are defined for each vaccine to prevent setting the date for a second dose too early.
The calendar view provides a clear overview of all the events for the currently selected month (desktop view) or week (mobile view), while the modal view shows all the patients with their vaccination dates in a list.
Finally, all users can turn on/off email reminders in the settings modal to receive emails every day at 7 AM UTC time with a list of patients that are set to be vaccinated on the following day.

## License

MIT
