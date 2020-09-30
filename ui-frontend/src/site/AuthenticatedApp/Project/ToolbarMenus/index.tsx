import React, { useState, useCallback, useRef } from "react";

import { createStyles, makeStyles, Theme } from "@material-ui/core";

import useOnClickOutside from "src/hooks/useOnClickOutside";

import styles from "./Header.module.css";
import Chevron from "./icons/Chevron";
import Tooltip from "./icons/Tooltip";
import {
  isDivider,
  isSubMenuItem,
  isTooltipMenuItem,
  Menu,
  SubMenuItem,
  TooltipMenuItem,
} from "./types";

interface Props {
  menus: Menu[];
}

const useStyles = makeStyles((theme: Theme) => createStyles({}));

interface TooltipBoyProps {
  id: string;
  item: TooltipMenuItem;
  onMouseEnter: any;
  open: boolean;
}

function TooltipBoy({ id, item, open, onMouseEnter }: TooltipBoyProps) {
  return (
    <div
      id={id}
      className={open ? styles.popwrapperOpen : styles.popwrapper}
      onMouseEnter={onMouseEnter}
    >
      <div
        className={item.disabled ? styles.disabled : styles.listItem}
        onClick={item.action}
      >
        {item.name}
        <Tooltip className={styles.chevronRightIcon} />
      </div>

      <div className={open ? styles.popoutOpenTooltip : styles.popout}>
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
    </div>
  );
}

interface SubSubBoyProps {
  id: string;
  item: SubMenuItem;
  onMouseEnter: any;
  open: boolean;
}

function SubSubBoy({ id, item, open, onMouseEnter }: SubSubBoyProps) {
  return (
    <div
      id={id}
      className={open ? styles.popwrapperOpen : styles.popwrapper}
      onMouseEnter={onMouseEnter}
    >
      <div className={item.disabled ? styles.disabled : styles.listItem}>
        {item.name}
        <Chevron className={styles.chevronRightIcon} />
      </div>

      <div className={open ? styles.popoutOpen : styles.popout}>
        {item.items.map((subItem) => {
          if (isDivider(subItem)) {
            return <div className={styles.listDivider} />;
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
    </div>
  );
}

interface SimpleBoyProps {
  item: any;
  onMouseEnter: any;
}

function SimpleBoy({ item, onMouseEnter }: SimpleBoyProps) {
  return (
    <div
      className={item.disabled ? styles.disabled : styles.listItem}
      onClick={item.action}
      onMouseEnter={onMouseEnter}
    >
      {item.name}
    </div>
  );
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
                if (isDivider(item)) {
                  return <div className={styles.listDivider} />;
                }

                const id = menu.name + "---" + item.name;
                const open = optionsOpen && lastHoveredSubOption === id;

                if (isSubMenuItem(item)) {
                  return (
                    <SubSubBoy
                      id={id}
                      onMouseEnter={handleSubOptionHover}
                      item={item}
                      open={open}
                    />
                  );
                }

                if (isTooltipMenuItem(item)) {
                  return (
                    <TooltipBoy
                      id={id}
                      onMouseEnter={handleSubOptionHover}
                      item={item}
                      open={open}
                    />
                  );
                }

                return (
                  <SimpleBoy item={item} onMouseEnter={handleSubOptionHover} />
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
