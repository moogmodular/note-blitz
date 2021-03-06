import autoAnimate from '@formkit/auto-animate'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'

import SiteMetaContext from './SiteMetaContext'
import TaxonomyList from './TaxonomyList'
import UserList from './UserList'

/* eslint-disable-next-line */
export interface SiteMetaProps {}

function TabPanel(props: any) {
    const { children, value, index, ...other } = props

    const parent = useRef(null)

    useEffect(() => {
        parent.current && autoAnimate(parent.current)
    }, [parent])

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            ref={parent}
        >
            {value === index && <div className="mt-8">{children}</div>}
        </div>
    )
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

const SiteMeta = (props: SiteMetaProps) => {
    const [value, setValue] = React.useState(0)

    const handleChange = (event: any, newValue: any) => {
        setValue(newValue)
    }

    return (
        <div className="h-1/4 border-2 border-black p-4">
            <Tabs value={value} onChange={handleChange} aria-label="site meta tabs">
                <Tab label="Context" {...a11yProps(0)} />
                <Tab label="Taxonomy" {...a11yProps(1)} />
                <Tab label="User list" {...a11yProps(2)} />
            </Tabs>
            <TabPanel value={value} index={2}>
                <UserList />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <TaxonomyList />
            </TabPanel>
            <TabPanel value={value} index={0}>
                <SiteMetaContext />
            </TabPanel>
        </div>
    )
}

export default SiteMeta
