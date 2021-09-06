import { KeyboardDatePicker } from "@material-ui/pickers";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

const Input = (props) => {
  return (
    <KeyboardDatePicker
      {...props}
      margin="dense"
      inputVariant="outlined"
      ampm={false}
      format="dd/MM/yyyy"
      minutesStep="5"
      cancelLabel="Odustani"
      okLabel="Potvrdi"
      leftArrowButtonProps={{
        color: "primary",
      }}
      rightArrowButtonProps={{
        color: "primary",
      }}
      fullWidth
    />
  );
};

const DateInput = (props) => {
  const { control } = useFormContext();
  const error = { invalid: false, message: "" };
  if (props.errors && props.errors.hasOwnProperty(props.name)) {
    error.invalid = true;
    error.message = props.errors[props.name].message;
  }

  return (
    <Controller
      as={Input}
      control={control}
      error={error.invalid}
      helperText={error.message}
      {...props}
    />
  );
};

export default DateInput;
