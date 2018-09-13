import React, { Component } from 'react'
import './App.css'

class App extends Component {
  render() {
    const sections = ['Unlabeled', 'Unlabeled — A Very Long Section Title', 'HDMI', 'VGA', 'USB', 'Thunderbolt', 'Micro USB', 'Mag Safe Power Cord', 'Planes', 'Trains', 'Automobiles', 'Infinity', 'And', 'Beyond']
    const collection = sections.map(title => {
      const min = 50
      const max = 500
      const imageCount =  Math.floor(Math.random() * (max - min) ) + min
      return {
          label: title,
          images: Array(imageCount).fill('').map(() => {
          // return 'https://picsum.photos/224/?random&t=' + Math.random()
          return 'https://loremflickr.com/240/240/dog?random=' + Math.random()
        })
      }
    })

    const allImageCount = collection.reduce((accumulator, section) => {
      return accumulator + section.images.length
    }, 0).toLocaleString()
    const labeledImageCount = collection.reduce((accumulator, section) => {
      if (section.label !== 'Unlabeled') {
        return accumulator + section.images.length
      }
      return accumulator
    }, 0).toLocaleString()
    const unlabeledImageCount = collection.reduce((accumulator, section) => {
      if (section.label === 'Unlabeled') {
        return accumulator + section.images.length
      }
      return accumulator
    }, 0).toLocaleString()

    return (
      <div>
        <div className="App-TopBar">
          <div className="App-TopBar-Title">Visual Recognition Tool</div>
          <div className="App-TopBar-BreadCrumb">&nbsp;/&nbsp;
            <a href="#TODO" className="App-TopBar-ServiceID">Visual Recognition-r0</a>
          </div>
        </div>
        <div className="App-MidBar">
          <div className="App-MidBar-Button App-MidBar-Projects">
            <svg className="icon-arrow" width="16" height="14" viewBox="0 0 16 14"><path d="M4.044 8.003l4.09 3.905-1.374 1.453-6.763-6.356L6.759.639 8.135 2.09 4.043 6.003h11.954v2H4.044z"></path></svg>Projects
          </div>
          <div className="App-MidBar-ProjectID">
            Brazil Cables Project
          </div>
          <div className="App-MidBar-Button App-MidBar-AddImages">
            <svg className="icon" width="16" height="16" viewBox="0 0 16 16"><path d="M7 7H4v2h3v3h2V9h3V7H9V4H7v3zm1 9A8 8 0 1 1 8 0a8 8 0 0 1 0 16z"></path></svg>Add Images
          </div>
        </div>
        <div className="App-LowBar" />
        <div className="App-Sidebar">
          <div className="App-Sidebar-Fixed-Items">
            <div className="App-Sidebar-Item--Active">
              <div className="App-Sidebar-Item-Title">All images</div>
              <div className="App-Sidebar-Item-Count">{allImageCount}</div>
            </div>
            <div className="App-Sidebar-Item">
              <div className="App-Sidebar-Item-Title">Labeled</div>
              <div className="App-Sidebar-Item-Count">{labeledImageCount}</div>
            </div>
            <div className="App-Sidebar-Item">
              <div className="App-Sidebar-Item-Title">Unlabeled</div>
              <div className="App-Sidebar-Item-Count">{unlabeledImageCount}</div>
            </div>
          </div>
          {collection.filter(section => { return section.label !== 'Unlabeled' }).map(section => {
            return (
              <div className="App-Sidebar-Item">
                <div className="App-Sidebar-Item-Title">{section.label}</div>
                <div className="App-Sidebar-Item-Count">{section.images.length.toLocaleString()}</div>
              </div>
            )
          })}
          <div className="App-Sidebar-Add-Label-Button">Add Label</div>
        </div>
        <div className="App-Parent">
          {collection.map(section => {
            return (
              <div>
                <div className="App-Section-Title"><div className="App-Section-Span">{section.label}</div></div>
                <div className="App-ImageGrid">
                  {section.images.map(image => {
                    return <img src={image} />
                  })}
                </div>
              </div>
            )
          })}

          <div className="App-ImageGrid-Gap"></div>
        </div>
      </div>
    )
  }
}

export default App
