import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import styles from "../../styles/apps.module.scss";
import PackPreview from "../../components/PackPreview";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import Alert from "../../components/Alert";
import { FiInfo } from "react-icons/fi";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";

function OwnProfile() {
  const [user, setUser] = useState();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading...");

  const router = useRouter();

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) {
        router.push(`/`);
        return;
      }

      let packs = await localStorage.getItem("ownPacks");

      if (packs != null) {
        setPacks(JSON.parse(packs));
        setLoading(false);
      } else {
        getPacks(session.user);
      }

      setUser(session.user);
    });
  }, []);

  const getPacks = async (user) => {
    const { response: packs, error } = await fetchWinstallAPI(
      `/packs/profile/${user.id}`,
      {
        headers: {
          Authorization: `${user.accessToken},${user.refreshToken}`,
        },
      }
    );

    if (error) {
      setStatus(error);
      return;
    }

    if (packs) {
      setPacks(packs);
      setLoading(false);
      localStorage.setItem("ownPacks", JSON.stringify(packs));
    }
  };

  const handleDelete = (id) => {
    const newPacks = packs.filter((p) => p._id != id);
    setPacks(newPacks);
  };

  return (
    <PageWrapper>
      {user && user.errors ? (
        <MetaTags title={`winstall`} path="/users/you" />
      ) : (
        <MetaTags title={`Your packs - winstall`} path="/users/you" />
      )}

      <div>
        <div className={styles.controls}>
          <h1>Your Packs</h1>

          {/* <Pagination/> */}
        </div>

        {loading ? (
          <p>{status}</p>
        ) : packs.length === 0 ? (
          <p>
            You don't have any packs yet. Try creating one first when selecting
            apps :)
          </p>
        ) : (
          <>
            <Alert
              id="packEditWarn"
              text="Note: changes to your own packs can take up to 10 minutes to appear due to resource limitations. This will be improved in the future."
            >
              <FiInfo />
            </Alert>
            <ul className={`${styles.all} ${styles.storeList}`}>
              {packs.map((pack) => (
                <li key={pack._id}>
                  <PackPreview
                    pack={pack}
                    showDelete={true}
                    auth={user}
                    deleted={handleDelete}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </PageWrapper>
  );
}

export default OwnProfile;
