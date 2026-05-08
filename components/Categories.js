import Link from "next/link";
import CategoryApp from "../components/CategoryApp";
import ListPackages from "../components/ListPackages";

import { FiPackage } from "react-icons/fi";

let Categories = ({ apps, category = "Category" }) => {
  if (!apps || apps.length === 0) return null;

  return (
    <div className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">{category}</h2>
      </div>
      <ListPackages>
        {apps.map((app) => (
          <CategoryApp app={app} key={app._id} />
        ))}
      </ListPackages>
    </div>
  );
};

export default Categories;
