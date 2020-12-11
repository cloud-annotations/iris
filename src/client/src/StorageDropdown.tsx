import React, { useCallback } from 'react'

import DropDown from 'common/DropDown/DropDown'

import { useDispatch, useSelector } from 'react-redux'
import { setActiveResource } from 'redux/resources'

function StorageDropdown() {
  const loadingResources = useSelector((state: any) => state.resources.loading)
  const resources = useSelector((state: any) => state.resources.resources)
  const activeResource = useSelector(
    (state: any) => state.resources.activeResource
  )

  const dispatch = useDispatch()

  const handleResourceChosen = useCallback(
    (item) => {
      dispatch(setActiveResource(item))
    },
    [dispatch]
  )

  const activeResourceObject = resources.find(
    (resource: any) => activeResource === resource.id
  )

  return (
    <DropDown
      active={
        !loadingResources && activeResourceObject && activeResourceObject.name
      }
      list={resources.map((resource: any) => ({
        display: resource.name,
        id: resource.id,
      }))}
      onChosen={handleResourceChosen}
      style={{
        margin: 0,
        border: '0px solid transparent',
        height: '100%',
      }}
      listStyle={{
        top: 0,
      }}
    />
  )
}

export default StorageDropdown
