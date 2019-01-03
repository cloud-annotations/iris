import React, { Component } from 'react'
import HorizontalListItem from './HorizontalListItem'
// import styles from './HorizontalListController.module.css'

export default class HorizontalListController extends Component {
  horizontalScrollRef = React.createRef()

  componentDidMount() {
    document.addEventListener('mousewheel', this.blockSwipeBack, false)
    document.addEventListener('keydown', this.handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('mousewheel', this.blockSwipeBack)
    document.removeEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown = e => {
    // if (e.which === 39) {
    //   e.preventDefault()
    //   this.setState(
    //     prevState => ({
    //       selection: prevState.selection + 1
    //     }),
    //     () => {
    //       this.loadForImage(
    //         this.props.bucket,
    //         this.props.collection.images.all[this.state.selection]
    //       )
    //     }
    //   )
    // } else if (e.which === 37) {
    //   e.preventDefault()
    //   this.setState(
    //     prevState => ({
    //       selection: prevState.selection - 1
    //     }),
    //     () => {
    //       this.loadForImage(
    //         this.props.bucket,
    //         this.props.collection.images.all[this.state.selection]
    //       )
    //     }
    //   )
    // }
  }

  blockSwipeBack = e => {
    e.stopPropagation()
    const scrollElement = this.horizontalScrollRef.current
    if (!scrollElement.contains(e.target)) {
      return
    }

    const max = scrollElement.scrollWidth - scrollElement.offsetWidth
    const scrollPosition = scrollElement.scrollLeft + e.deltaX

    if (scrollPosition < 0 || scrollPosition > max) {
      e.preventDefault()
      scrollElement.scrollLeft = Math.max(0, Math.min(max, scrollPosition))
    }
  }

  handleItemSelected = (e, index) => {
    const { onSelectionChanged } = this.props
    onSelectionChanged(index)
  }

  render() {
    const { delegate, selection } = this.props
    return (
      <div
        ref={this.horizontalScrollRef}
        style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          right: '0',
          height: '117px',
          display: 'flex',
          overflow: 'auto',
          alignItems: 'center',
          borderTop: '1px solid #dfe3e6'
        }}
      >
        {[...Array(delegate.numberOfItems)].map((_, i) => (
          <HorizontalListItem
            index={i}
            key={delegate.keyForItemAt(i)}
            style={{ height: '80px', margin: '0 8px' }}
            onItemSelected={this.handleItemSelected}
            listItem={delegate.cellForItemAt(i, selection === i)}
          />
        ))}
      </div>
    )
  }
}
