// import React from 'react'
import { Tooltip as ReactTooltip } from "react-tooltip";

const SideBarTooltip = ({id, content}: {id:string, content:string}) => {
  return (
    <ReactTooltip
        id={id}
        place="right"
        variant="info"
        content={content}
        className='bg-[#fff]'
        style={{backgroundColor: "white", color:'black', borderRadius: "6px", fontWeight: 'bold', fontSize: '14px'}}
    />
  )
}

export default SideBarTooltip