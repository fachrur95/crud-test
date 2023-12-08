import useInfiniteDivision from "@/components/hooks/options/useInfiniteDivision";
import React from "react";
import { type FieldPath, type FieldValues } from "react-hook-form";
import {
  AutocompleteElement,
  type AutocompleteElementProps,
} from "react-hook-form-mui";

const AutoCompleteDivision = <TFieldValues extends FieldValues>(
  props: Omit<
    AutocompleteElementProps<TFieldValues, FieldPath<TFieldValues>>,
    "options"
  >,
): JSX.Element => {
  const { options, isFetching, renderOption, onSearch } = useInfiniteDivision();

  return (
    <AutocompleteElement
      {...props}
      options={options}
      loading={isFetching}
      textFieldProps={{
        ...props.textFieldProps,
        onChange: onSearch,
      }}
      autocompleteProps={{
        ...props.autocompleteProps,
        onClose: () => onSearch(),
        renderOption,
        disableClearable: props.required,
        autoHighlight: true,
        openOnFocus: true,
      }}
    />
  );
};

export default AutoCompleteDivision;
