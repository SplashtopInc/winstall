import styles from "../styles/packPreview.module.scss";
import AppIcon from "./AppIcon";
import { useState, useEffect} from "react";
import { FiEdit, FiPackage, FiTrash2 } from "react-icons/fi";
import Link from "next/link";
import fetchWinstallAPI from "../utils/fetchWinstallAPI";

export default function PackPreview({ pack, hideMeta, showDelete=false, auth, deleted}){
    const [appIcons, setIcons] = useState([]);

    useEffect(() => {
        const appIcons = pack.apps.filter(a => a.icon != "" ).map(a => ({
            icon: a.icon,
            iconUrl: a.iconUrl,
            iconPng: a.iconPng,
            _id: a._id
        }));

        setIcons([...appIcons].slice(0, 4));

    }, [])

    const deletePack = async () => {
        if(!auth) return;

        const { response } = await fetchWinstallAPI(`/packs/${pack._id}`, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ creator: pack.creator })
        });

        if(response && response.msg){
            if(deleted) deleted(pack._id);
            localStorage.removeItem("ownPacks");
        }
    }

    const handleDelete = async (e) => {
        if ('confirm' in window && typeof window.confirm === 'function') {
            if (window.confirm("Are you sure you want to delete this pack?")) {
                deletePack();
            }
        } else {
            deletePack();
        }

    }

    return (
        <div className={styles.packCard}>
            <Link href="/packs/[id]" as={`/packs/${pack._id}`} prefetch={false}>
                <header className={`${styles.packIcons} ${appIcons.length <= 2? styles.singleIcon : ""}`} id={pack.accent}>
                    <ul style={{gridTemplateColumns: `repeat(${appIcons.length > 4 ? "4": appIcons.length},1fr)`}}>
                        {
                            appIcons.map((app, index) => <li key={index}><AppIcon icon={app.icon} iconUrl={app.iconUrl} iconPng={app.iconPng} id={app._id}/></li>)
                        }
                        { appIcons.length === 0 && (
                            <li><FiPackage/></li>
                        )}
                    </ul>
                </header>
            </Link>
            {!hideMeta && (
                <div className={styles.packMeta}>
                    <Link href="/packs/[id]" as={`/packs/${pack._id}`} prefetch={false}><h3>{pack.title}</h3></Link>
                    <p>{pack.desc}</p>
                    <p className={styles.includes}>Includes {pack.apps.slice(0, 3).map(a => a.name).join(", ")}, and more.</p>
                    <div className="box fBox">
                        <Link href="/packs/[id]" as={`/packs/${pack._id}`} prefetch={false} className="button accent">
                            <FiPackage /> View Pack
                        </Link>

                        { showDelete && (
                            <div className={styles.packEdit}>
                                <Link href={`/packs/edit?id=${pack._id}`} prefetch={false} title="Edit Pack" className={`button subtle ${styles.delete}`}><FiEdit /></Link>
                                <button className={`button subtle ${styles.delete}`} title="Delete Pack" onClick={handleDelete}><FiTrash2 /></button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}