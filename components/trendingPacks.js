import TrendingPackCard from "./trendingPackCard";
import styles from "../styles/trendingPacks.module.scss";

export default function TrendingPacks({ packs = [] }) {
  if (!Array.isArray(packs) || packs.length === 0) return null;

  const rankedPacks = [...packs].sort(
    (first, second) => Number(first.rank) - Number(second.rank)
  );

  return (
    <section className="homeBlock">
      <div className="box">
        <h2 className="blockHeader">Trending Packs</h2>
      </div>
      <h3 className="blockSubtitle">Popular pack downloads this week.</h3>
      <div className={styles.grid}>
        {rankedPacks.map((pack, index) => (
          <TrendingPackCard key={pack._id} pack={pack} index={index} />
        ))}
      </div>
    </section>
  );
}
