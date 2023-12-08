import FormatListBulleted from "@mui/icons-material/FormatListBulleted";

export type DataMenuType = {
  id: string;
  label: string;
  depth: number;
  url: string;
  icon: React.ReactNode;
  children: DataMenuType[];
};

const data: DataMenuType[] = [
  {
    id: "division",
    label: "Divisions",
    depth: 0,
    url: "/",
    icon: <FormatListBulleted fontSize="small" />,
    children: [],
  },
];

export default data;
