import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import React from "react";
import { Controller, useFormContext } from "react-hook-form";

const Input = ({ name, label, options, helperText, error, ...other }) => {
  return (
    <FormControl variant="outlined" margin="dense" fullWidth>
      <InputLabel error={error} htmlFor={name}>
        {label}
      </InputLabel>
      <Select
        {...other}
        error={error}
        label={label}
        inputProps={{
          name: name,
          id: name,
        }}
      >
        {options.map((item, index) =>
          item.value === "" ? (
            <MenuItem key={index} value={item.value}>
              <em>None</em>
            </MenuItem>
          ) : (
            <MenuItem key={index} value={item.value} disabled={item.disabled}>
              {item.text}
            </MenuItem>
          )
        )}
      </Select>
      {helperText && <FormHelperText error>{helperText}</FormHelperText>}
    </FormControl>
  );
};

const SelectInput = (props) => {
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

export default SelectInput;
