import React from "react";

import Divider from "./Divider";
import styles from "./Header.module.css";
import Chevron from "./icons/Chevron";
import Tooltip from "./icons/Tooltip";
import { isDivider, isSubMenuItem, isTooltipMenuItem, MenuItem } from "./types";

interface FlyOutProps {
  item: MenuItem;
}
function FlyOut({ item }: FlyOutProps) {
  if (isSubMenuItem(item)) {
    return (
      <div className={styles.popoutOpen}>
        {item.items.map((subItem) => {
          if (isDivider(subItem)) {
            return <Divider />;
          }

          return (
            <div
              className={subItem.disabled ? styles.disabled : styles.listItem}
              onClick={subItem.action}
            >
              {subItem.name}
            </div>
          );
        })}
      </div>
    );
  }

  if (isTooltipMenuItem(item)) {
    return (
      <div className={styles.popoutOpenTooltip}>
        <div className={styles.tooltipper}>
          <h6 className={styles.tooltipH6}>{item.tooltip.title}</h6>
          <p className={styles.tooltipP}>{item.tooltip.description}</p>
          <div className={styles.tooltipFooter}>
            <a
              href={item.tooltip.link}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tooltipLink}
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

interface ItemProps {
  id: string;
  item: MenuItem;
  onMouseEnter: any;
  open: boolean;
}
function Item({ id, item, open, onMouseEnter }: ItemProps) {
  return (
    <div
      id={id}
      className={
        open && !item.disabled ? styles.popwrapperOpen : styles.popwrapper
      }
      onMouseEnter={onMouseEnter}
    >
      <div className={item.disabled ? styles.disabled : styles.listItem}>
        {item.name}
        {isSubMenuItem(item) && <Chevron className={styles.chevronRightIcon} />}
        {isTooltipMenuItem(item) && (
          <Tooltip className={styles.chevronRightIcon} />
        )}
      </div>

      {open && !item.disabled && <FlyOut item={item} />}
    </div>
  );
}

export default Item;
