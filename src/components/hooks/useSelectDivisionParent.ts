import { api } from "@/utils/api";

const useSelectDivisionParent = (id: number) => {
  const result = api.division.findOne.useQuery({ id: String(id) });

  return result;
};

export default useSelectDivisionParent;
