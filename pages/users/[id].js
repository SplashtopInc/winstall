import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import styles from "../../styles/apps.module.scss";
import PackPreview from "../../components/PackPreview";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import Error from "../../components/Error";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";
import { normalizeTwitterUser } from "../../utils/helpers";

function UserProfile({ uid }) {
  const [user, setUser] = useState();
  const [title, setTitle] = useState("Loading...");
  const [packs, setPacks] = useState([]);
  const [status, setStatus] = useState("Getting packs...");

  useEffect(() => {
    getSession().then(async (session) => {
      const { response } = await fetch("/api/twitter/", {
        method: "GET",
        headers: {
          endpoint: `https://api.twitter.com/2/users/${uid}`,
        },
      }).then((res) => res.json());

      const normalizedUser = normalizeTwitterUser(response, uid);

      if (!session || session.user.id !== parseInt(uid)) {
        setTitle(`Packs created by @${normalizedUser.screen_name}`);
        getPacks(uid);
      }

      setUser(normalizedUser);
    });
  }, []);

  const getPacks = async (id, cache = true) => {
    const { response } = await fetchWinstallAPI(
      `/packs/${cache ? "users" : "profile"}/${uid}`,
      {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_TWITTER_SECRET,
        },
      }
    );

    if (response) {
      setPacks(response);
      if (response.length === 0)
        setStatus("This user does not have any packs yet.");
      if (!cache) localStorage.setItem("ownPacks", JSON.stringify(response));
    }
  };

  return (
    <PageWrapper>
      {user && user.errors ? (
        <MetaTags title={`winstall`} />
      ) : (
        <MetaTags title={`${title} - winstall`} />
      )}

      {user && user.errors ? (
        <Error title="User does not exist" />
      ) : (
        <div>
          <div className={styles.controls}>
            <h1>{title}</h1>

            {/* <Pagination/> */}
          </div>

          <ul className={`${styles.all} ${styles.storeList}`}>
            {packs.map((pack) => (
              <li key={pack._id}>
                <PackPreview pack={pack} />
              </li>
            ))}
          </ul>

          {user && packs.length === 0 && <p>{status}</p>}
        </div>
      )}
    </PageWrapper>
  );
}

UserProfile.getInitialProps = async (ctx) => {
  return {
    uid: ctx.query.id,
  };
};

export default UserProfile;
