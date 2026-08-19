import Link from "next/link";
import SingleApp from "../components/SingleApp";
import ListPackages from "../components/ListPackages";

import { FiPackage } from "react-icons/fi";

let RecentApps = ({ apps }) => {

  return (
    <div className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">Recent Updates</h2>
        <Link href="/apps" className="button small">
          <FiPackage />
          View All
        </Link>
      </div>
      <h3 className="blockSubtitle">
        All the newest apps and updates. Click the + sign to include an app on your install script.
      </h3>
      <ListPackages>
        {apps.map((app) => (
          <SingleApp app={app} key={app._id} showTime/>
        ))}
      </ListPackages>
    </div>
  );
};

export default RecentApps;
