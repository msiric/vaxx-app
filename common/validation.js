import * as Yup from "yup";

const userUsername = Yup.string()
  .required("Potrebno je upisati korisničko ime")
  .matches(
    /^([\w.]){0,}$/,
    "Korisničko ime može sadržavati samo slova, brojeve, podvlake i točke"
  )
  .min(5, "Korisničko ime mora sadržavati minimalno 5 znakova")
  .max(20, "Korisničko ime može sadržavati maksimalno 20 znakova");

const userPassword = Yup.string()
  .required("Potrebno je upisati zaporku")
  .min(8, "Zaporka mora sadržavati minimalno 8 znamenki")
  .max(300, "Zaporka može sadržavati maksimalno 300 znamenki");

export const signupValidation = Yup.object().shape({
  userUsername,
  userEmail: Yup.string()
    .required("Potrebno je upisati email adresu")
    .email("Neispravna email adresa"),
  userPassword,
  userConfirm: Yup.string().when(["userPassword"], {
    is: (userPassword) => userPassword && userPassword.trim() !== "",
    then: Yup.string()
      .required("Potrebno je upisati ponovljenu zaporku")
      .oneOf([Yup.ref("userPassword")], "Zaporke se ne podudaraju"),
    otherwise: Yup.string().required("Potrebno je upisati ponovljenu zaporku"),
  }),
});

export const loginValidation = Yup.object().shape({
  userUsername,
  userPassword,
});

export const preferencesValidation = Yup.object().shape({
  userReminders: Yup.string()
    .required("Potrebno je odabrati izbor podsjetnika")
    .oneOf(["enabled", "disabled"], "Neispravna vrijednost podsjetnika"),
});

export const eventValidation = Yup.object().shape({
  patientVaxxed: Yup.string()
    .required("Potrebno polje")
    .matches(/(first|second)/, "Neispravan izbor"),
  patientName: Yup.string()
    .required("Potrebno je ime pacijenta")
    .min(5, "Ime pacijenta mora sadržavati minimalno 5 znakova")
    .max(80, "Ime pacijenta može sadržavati maksimalno 80 znakova"),
  patientDOB: Yup.date()
    .nullable()
    .default(null)
    .notRequired()
    .when(["patientVaxxed"], {
      is: (patientVaxxed) => patientVaxxed === "first",
      then: Yup.date()
        .required("Potreban je datum rođenja pacijenta")
        .typeError("Neispravan datum"),
    }),
  patientMBO: Yup.string()
    .notRequired()
    .when(["patientVaxxed"], {
      is: (patientVaxxed) => patientVaxxed === "first",
      then: Yup.string()
        .required("Potreban je MBO pacijenta")
        .min(9, "MBO mora sadržavati 9 znamenki")
        .max(9, "MBO mora sadržavati 9 znamenki"),
    }),
  patientVaccine: Yup.string()
    .required("Potrebno je odabrati cjepivo")
    .matches(
      /(moderna|astrazeneca|pfizer|johnson)/,
      "Neispravan izbor cjepiva"
    ),
  vaccineIdentifier: Yup.string()
    .required("Potrebna je šifra cjepiva")
    .min(3, "Šifra cjepiva mora sadržavati minimalno 3 znaka")
    .max(20, "Šifra cjepiva može sadržavati maksimalno 20 znakova"),
  patientDate: Yup.date()
    .required("Potreban je datum cijepljenja")
    .test("isModulo5", "Minute moraju biti u odmaku od 5", (value) => {
      const minutes = new Date(value).getMinutes();
      return minutes % 5 === 0;
    })
    .typeError("Neispravan datum"),
});

export const emptyValidation = Yup.object().shape({});
