import React from "react";

import styles from "./ImageTileV3.module.css";

interface ImageTileV4Props {
  selected?: boolean;
  secondarySelected?: boolean;
  url: string;
}

function ImageTileV4({ selected, secondarySelected, url }: ImageTileV4Props) {
  return (
    <div
      className={
        selected
          ? styles.selected
          : secondarySelected
          ? styles.secondarySelected
          : styles.container
      }
    >
      <div className={styles.highlight} />
      <img draggable={false} className={styles.image} alt="" src={url} />
      <div className={styles.iconWrapper}>
        <svg className={styles.icon} width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16zm3.646-10.854L6.75 10.043 4.354 7.646l-.708.708 3.104 3.103 5.604-5.603-.708-.708z" />
        </svg>
      </div>
    </div>
  );
}
export default ImageTileV4;
