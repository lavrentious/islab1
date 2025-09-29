import React from "react";
import { HumanBeing } from "../api/types";

interface HumanBeingsTableProps {
  items: HumanBeing[];
}

const HumanBeingsTable: React.FC<HumanBeingsTableProps> = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <pre>{JSON.stringify(item, null, 2)}</pre>
        </li>
      ))}
    </ul>
  );
};

export default HumanBeingsTable;
