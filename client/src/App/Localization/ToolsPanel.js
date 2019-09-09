import React, { useCallback } from 'react'
import { connect } from 'react-redux'

import { setActiveTool } from 'redux/editor'
import { MOVE, BOX } from 'common/Canvas/Canvas'
import styles from './ToolsPanel.module.css'

const ToolsPanel = ({ tool, setActiveTool }) => {
  const handleToolChosen = useCallback(
    tool => () => {
      setActiveTool(tool)
    },
    [setActiveTool]
  )

  return (
    <div className={styles.wrapper}>
      <div
        onClick={handleToolChosen(MOVE)}
        className={tool === MOVE ? styles.toolActive : styles.tool}
      >
        <svg className={styles.move} width="20" height="20" viewBox="0 0 40 40">
          <path d="M19,11h2V29H19V11Zm-8,8H29v2H11V19ZM21,35H19l-4-6H25ZM35,19v2l-6,4V15ZM5,21V19l6-4V25ZM19,5h2l4,6H15Z" />
        </svg>
      </div>

      <div
        onClick={handleToolChosen(BOX)}
        className={tool === BOX ? styles.toolActive : styles.tool}
      >
        <svg className={styles.box} width="20" height="20" viewBox="0 0 40 40">
          <rect x="4" y="8" width="32" height="24" />
        </svg>
      </div>
    </div>
  )
}

const mapStateToProps = state => ({
  tool: state.editor.tool
})
const mapDispatchToProps = {
  setActiveTool
}
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ToolsPanel)
