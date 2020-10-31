import React, { useState, useCallback, useRef } from "react";

import { useClickOutside } from "@iris/hooks";

import Divider from "./Divider";
import styles from "./Header.module.css";
import MenuItem from "./MenuItem";
import { isDivider, Menu } from "./types";

interface Props {
  menus: Menu[];
}

function ToolbarMenus({ menus }: Props) {
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

  useClickOutside(optionsRef, handleClickOutside, true);

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
                if (isDivider(item)) {
                  return <Divider />;
                }

                const id = menu.name + "---" + item.name;
                const open = optionsOpen && lastHoveredSubOption === id;

                return (
                  <MenuItem
                    id={id}
                    open={open}
                    item={item}
                    onMouseEnter={handleSubOptionHover}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToolbarMenus;
