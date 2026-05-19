import Image from "next/image";
import styles from "./HeroBanner.module.css";

export default function HeroBanner() {
  return (
    <section className={styles.hero}>

      {/* Left panel — Homme */}
      <div className={styles.panelLeft}>
        <Image
          src="/images/img2.png"
          alt="Collection Homme"
          fill
          priority
          sizes="50vw"
          className={styles.imgLeft}
        />
      </div>

      {/* Right panel — Femme */}
      <div className={styles.panelRight}>
        <Image
          src="/images/img5.png"
          alt="Collection Femme"
          fill
          priority
          sizes="50vw"
          className={styles.imgRight}
        />
      </div>

      {/* Gold corners */}
      <div className={`${styles.corner} ${styles.cornerTl}`} />
      <div className={`${styles.corner} ${styles.cornerTr}`} />
      <div className={`${styles.corner} ${styles.cornerBl}`} />
      <div className={`${styles.corner} ${styles.cornerBr}`} />

      {/* Center brand spine */}
      <div className={styles.centerBrand}>
        <div className={styles.lineTop} />
        <div className={styles.logoCenter}>
          <Image
            src="/images/logo.png"
            alt="Effluve logo"
            width={64}
            height={64}
            className={styles.logoImg}
          />
          <div className={styles.brandName}>EFFLUVE</div>
          <div className={styles.tagline}>Expérience Sensorielle</div>
          <div className={styles.tricolor}>
            <span style={{ background: "#002395" }} />
            <span style={{ background: "#EDECE8" }} />
            <span style={{ background: "#ED2939" }} />
          </div>
        </div>
        <div className={styles.lineBottom} />
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.navItem}>Collection Automne 2026</span>
        <span className={styles.navItem}>Mode Éthique · Fait en France</span>
      </div>

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <span className={styles.label}>Homme</span>
        <span className={styles.collection}>Nouvelle Collection</span>
        <span className={styles.label}>Femme</span>
      </div>

    </section>
  );
}
