import Typography from "@mui/material/Typography";
import React from "react";
import useSelectDivisionParent from "../hooks/useSelectDivisionParent";

interface IShowDivisionParentProps {
  id?: number | null;
}

const ShowDivisionParent = ({ id }: IShowDivisionParentProps) => {
  if (!id) {
    return (
      <Typography variant="body2" className="italic">
        No Parent
      </Typography>
    );
  }

  const { data, isFetching, isLoading } = useSelectDivisionParent(id);

  if (isFetching || isLoading) {
    return (
      <Typography variant="body2" className="italic">
        Loading...
      </Typography>
    );
  }

  return <Typography variant="body2">{data?.name ?? "Not Found"}</Typography>;
};

export default ShowDivisionParent;
