import Link from "next/link";
import PrettyApp from "../components/PrettyApp";
import ListPackages from "../components/ListPackages";

import PopularContext from "../ctx/PopularContext";

import { FiPackage } from "react-icons/fi";
import { useEffect, useContext } from "react";

let PopularApps = ({ apps }) => {
  const { popular, setPopular } = useContext(PopularContext);

  useEffect(() => {
    if (popular.length === 0 && Array.isArray(apps) && apps.length > 0) {
      setPopular(apps.slice(0, 16));
    }
  }, [apps, popular.length, setPopular]);

  return (
    <PopularContext.Consumer>
      {({ popular }) => (
        <div className="homeBlock">
          <div className="box">
            <h2 className="blockHeader">Popular Apps</h2>
            <Link href="/apps" className="button small">
              <FiPackage />
              View All
            </Link>
          </div>
          <h3 className="blockSubtitle">
            The essentials for your new Windows device.
          </h3>
          <ListPackages popular>
            {popular.map((app) => (
              <PrettyApp app={app} key={app._id} />
            ))}
          </ListPackages>
        </div>
      )}
    </PopularContext.Consumer>
  );
};

export default PopularApps;