import * as fns from "date-fns";
const { format } = fns;

export const formatDate = (date, form) => {
  return format(new Date(date), form);
};

export const isArrayEmpty = (array) => {
  return !array.length;
};

export const isObjectEmpty = (object) => {
  for (let item in object) {
    if (object.hasOwnProperty(item)) return false;
  }
  return true;
};
