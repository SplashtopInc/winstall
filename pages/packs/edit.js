import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import Error from "../../components/Error";
import PageWrapper from "../../components/PageWrapper";
import MetaTags from "../../components/MetaTags";
import styles from "../../styles/create.module.scss";
import Router from "next/router";
import CreatePackForm from "../../components/CreatePackForm";
import PackAppsList from "../../components/PackAppsList";
import fetchWinstallAPI from "../../utils/fetchWinstallAPI";

export default function Edit() {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  const [packId, setPackId] = useState();
  const [pack, setPack] = useState();
  const [notFound, setNotFound] = useState(false);
  const [accessDenied, denyAccess] = useState(false);
  const [packApps, setPackApps] = useState([]);

  useEffect(() => {
    getSession().then(async (session) => {
      if (session && session.user) setUser(session.user);

      setPackId(Router.query.id);

      if (session && session.user && Router.query.id) {
        checkPack(Router.query.id, session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const checkPack = async (id, userId) => {
    let { response: pack, error } = await fetchWinstallAPI(`/packs/${id}`);

    if (!pack) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    if (pack.creator === userId) {
      const appsList = pack.apps;

      const getIndividualApps = appsList.map(async (app, index) => {
        return new Promise(async (resolve) => {
          let { response: appData, error } = await fetchWinstallAPI(
            `/apps/${app._id}`
          );

          if (error) appData = null;

          appsList[index] = appData;
          resolve();
        });
      });

      await Promise.all(getIndividualApps).then(() => {
        pack.apps = appsList.filter((app) => app != null);
      });

      setPack(pack);
      setPackApps(pack.apps);
      setLoading(false);
    } else {
      setLoading(false);
      denyAccess(true);
    }
  };

  if (loading)
    return (
      <PageWrapper>
        <p>Loading...</p>
      </PageWrapper>
    );

  // If no session exists, display access denied message
  if (!user)
    return (
      <Error
        title="You are not logged in!"
        subtitle="Please login first to be able to edit a pack."
      />
    );

  // If no pack ID query, return error
  if (!packId || notFound)
    return (
      <Error
        title="No pack found"
        subtitle="You are trying to edit a pack that doesn't exist."
      />
    );

  // If pack isn't owned by this user
  if (accessDenied)
    return (
      <Error
        title="Access Denied"
        subtitle="You are trying to edit a pack that you don't own."
      />
    );

  // If everything passes, let them edit
  if (!pack) return <></>;

  const updatePackApps = (apps) => {
    setPackApps(apps);
  };

  return (
    <PageWrapper>
      <MetaTags title="Edit Your WinGet App Pack | winstall" path="/packs/edit" desc="Update your WinGet app pack, manage included apps, and keep your Windows install bundle current." />

      <div className={styles.content}>
        <h1>Edit Pack</h1>

        {/* <Alert id="packEditWarn" text="Note: changes to your own packs can take up to 10 minutes to appear due to resource limitations. This will be improved in the future.">
                    <FiInfo/>
                </Alert> */}

        <CreatePackForm
          user={user}
          packApps={packApps}
          editMode={true}
          defaultValues={{
            _id: pack._id,
            title: pack.title,
            description: pack.desc,
            accent: pack.accent,
            isUnlisted: pack.isUnlisted,
          }}
        />

        {/* <p>Note: it may take up to 10 minutes for your changes to apply for you and others on the site.</p> */}

        <br />
        <br />

        <PackAppsList
          notLoggedIn={user === null}
          providedApps={packApps}
          reorderEnabled={true}
          onListUpdate={updatePackApps}
        />
      </div>
    </PageWrapper>
  );
}

export async function getStaticProps() {
  return {
    props: {},
    revalidate: 600,
  };
}
