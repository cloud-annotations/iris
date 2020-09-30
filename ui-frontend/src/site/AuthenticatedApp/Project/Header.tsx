import React, { useState, useCallback, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";
import { Link } from "react-router-dom";

import { ProfileDropDown } from "src/common/DropDown/DropDown";
import useOnClickOutside from "src/hooks/useOnClickOutside";

import styles from "./Header.module.css";

interface Menu {
  name: string;
  items: MenuItem[];
}

interface MenuItem {
  name?: string;
  items?: MenuItem[];
  tooltip?: Tooltip;
  disabled?: boolean;

  action?: () => void;
  link?: string;
  divider?: boolean;
}

interface Tooltip {
  title: string;
  description: string;
  link: string;
}

interface Props {
  menus: Menu[];
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: "absolute",
      display: "flex",
      alignItems: "center",
      top: 0,
      bottom: 0,
      right: 0,
      left: 0,
      backgroundColor: theme.palette.coolGray[90],
    },
  })
);

// function Menu() {
//   return
// }

function Menus({ menus }: Props) {
  const optionsRef = useRef<HTMLDivElement>(null);

  const [optionsOpen, setOptionsOpen] = useState(false);
  const [lastHoveredOption, setLastHoveredOption] = useState(undefined);
  const [lastHoveredSubOption, setLastHoveredSubOption] = useState(undefined);

  const handleOptionClick = useCallback(() => {
    setOptionsOpen(true);
  }, []);

  const handleClickOutside = useCallback(() => {
    setLastHoveredSubOption(undefined);
    setOptionsOpen(false);
  }, []);

  const handleOptionHover = useCallback((e) => {
    setLastHoveredOption(e.currentTarget.id);
    setLastHoveredSubOption(undefined);
  }, []);

  const handleSubOptionHover = useCallback((e) => {
    // TODO: Create some sort of timer to prevent opening other menus.
    setLastHoveredSubOption(e.currentTarget.id);
  }, []);

  useOnClickOutside(optionsRef, handleClickOutside, true);

  return (
    <div ref={optionsRef} className={styles.options}>
      {menus.map((menu) => {
        return (
          <div
            id={menu.name}
            className={
              optionsOpen && lastHoveredOption === menu.name
                ? styles.optionOpen
                : styles.option
            }
            onClick={handleOptionClick}
            onMouseEnter={handleOptionHover}
          >
            {menu.name}
            <div
              className={
                optionsOpen && lastHoveredOption === menu.name
                  ? styles.optionCardOpen
                  : styles.optionCard
              }
            >
              {menu.items.map((item) => {
                if (item.divider) {
                  return <div className={styles.listDivider} />;
                }
                if (item.items) {
                  return (
                    <div
                      id={menu.name + "---" + item.name}
                      className={
                        optionsOpen &&
                        lastHoveredSubOption === menu.name + "---" + item.name
                          ? styles.popwrapperOpen
                          : styles.popwrapper
                      }
                      onMouseEnter={handleSubOptionHover}
                    >
                      <div
                        className={
                          item.disabled ? styles.disabled : styles.listItem
                        }
                      >
                        {item.name}
                        <svg
                          className={styles.chevronRightIcon}
                          focusable="false"
                          preserveAspectRatio="xMidYMid meet"
                          width="16"
                          height="16"
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                        >
                          <path d="M22 16L12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"></path>
                        </svg>
                      </div>

                      <div
                        className={
                          optionsOpen &&
                          lastHoveredSubOption === menu.name + "---" + item.name
                            ? styles.popoutOpen
                            : styles.popout
                        }
                      >
                        {item.items.map((subItem) => {
                          if (subItem.divider) {
                            return <div className={styles.listDivider} />;
                          }
                          return (
                            <div
                              className={
                                subItem.disabled
                                  ? styles.disabled
                                  : styles.listItem
                              }
                              onClick={subItem.action}
                            >
                              {subItem.name}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                if (item.tooltip) {
                  return (
                    <div
                      id={menu.name + "---" + item.name}
                      className={
                        optionsOpen &&
                        lastHoveredSubOption === menu.name + "---" + item.name
                          ? styles.popwrapperOpen
                          : styles.popwrapper
                      }
                      onMouseEnter={handleSubOptionHover}
                    >
                      <div
                        className={
                          item.disabled ? styles.disabled : styles.listItem
                        }
                        onClick={item.action}
                      >
                        {item.name}
                        <svg
                          className={styles.chevronRightIcon}
                          focusable="false"
                          preserveAspectRatio="xMidYMid meet"
                          width="16"
                          height="16"
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                        >
                          <polygon points="17 22 17 13 13 13 13 15 15 15 15 22 12 22 12 24 20 24 20 22 17 22" />
                          <path d="M16,7a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,7Z" />
                          <path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z" />
                        </svg>
                      </div>

                      <div
                        className={
                          optionsOpen &&
                          lastHoveredSubOption === menu.name + "---" + item.name
                            ? styles.popoutOpenTooltip
                            : styles.popout
                        }
                      >
                        <div className={styles.tooltipper}>
                          <h6 className={styles.tooltipH6}>
                            {item.tooltip.title}
                          </h6>
                          <p className={styles.tooltipP}>
                            {item.tooltip.description}
                          </p>
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
                    </div>
                  );
                }
                return (
                  <div
                    className={
                      item.disabled ? styles.disabled : styles.listItem
                    }
                    onClick={item.action}
                    onMouseEnter={handleSubOptionHover}
                  >
                    {item.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const menus: Menu[] = [
  {
    name: "File",
    items: [
      { name: "Upload media", action: () => {} },
      { name: "Upload model zip", action: () => {} },
      { divider: true },
      { name: "Import dataset", action: () => {} },
      { divider: true },
      { name: "Export as YOLO", action: () => {} },
      { name: "Export as Create ML", action: () => {} },
      { name: "Export as Pascal VOC", action: () => {} },
      {
        name: "Export as Maximo Visual Inspection",
        action: () => {},
        tooltip: {
          title: "IBM Maximo Visual Inspection",
          description:
            "A platform tailored for domain experts to label, train and deploy models for variety of industrial use cases. Quickly build solutions at the edge, monitor assets and inspect production lines for quality.",
          link: "https://www.ibm.com/products/ibm-maximo-visual-inspection",
        },
      },
      { name: "Export as zip", action: () => {} },
      {
        name: "Export as Notebook (.ipynb)",
        action: () => {},
        disabled: true,
      },
    ],
  },
  {
    name: "Image", // Images (3)
    items: [
      { name: "Delete", action: () => {} },
      { divider: true },
      { name: 'Mark as "negative"', action: () => {} },
      {
        name: "Mark as",
        action: () => {},
        items: [
          { name: "up", action: () => {} }, // dynamic
          { name: "down", action: () => {} }, // dynamic
        ],
      },
    ],
  },
];

const project = "thumbs-up-down-v2";
const saving = 0;

function Header() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Link to="/projects" className={styles.home}>
        <svg className={styles.homeIcon} viewBox="0 0 32 32">
          <path d="M11.17 6l3.42 3.41.58.59H28v16H4V6h7.17m0-2H4a2 2 0 0 0-2 2v20a2 2 0 0 0 2 2h24a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2H16l-3.41-3.41A2 2 0 0 0 11.17 4z" />
        </svg>
      </Link>
      <div className={styles.headerWrapper}>
        <div className={styles.bucketName}>{project}</div>
        <div className={styles.options}>
          <Menus menus={menus} />
          <div className={styles.saved}>
            {saving > 0 ? "Saving..." : "Saved"}
          </div>
        </div>
      </div>

      <ProfileDropDown profile={{}} />
    </div>
  );
}

export default Header;
