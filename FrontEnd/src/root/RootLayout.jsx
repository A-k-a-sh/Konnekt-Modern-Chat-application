
var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };


import { Flex, Splitter, Typography } from 'antd';



import React from 'react'

import { Divider } from 'antd'

import Right from './Pages/Right Side/Right'
import { Outlet } from 'react-router-dom'
import LeftSideBar from './Pages/Left side/LeftSideBar'
import UserGroupDetails from './Pages/UserGroupDetails/UserGroupDetails'
import { PanelProvider, usePanelContext } from '../Context/PanelContext'

import RightContext from './Pages/Right Side/Right Context/RightContext'
const RootLayout = _a => {
    var { style } = _a,
        restProps = __rest(_a, ['style']);
    return (
        <PanelProvider>
            <Flex gap="middle" vertical>
                <CustomSplitter />
            </Flex>
        </PanelProvider>
    )
}


const CustomSplitter = _a => {
    var { style } = _a,
        restProps = __rest(_a, ['style']);

    const { isPanelOpen, setIsPanelOpen } = usePanelContext();
    const [panelSize, setPanelSize] = React.useState('0%');

    // Update panel size when isPanelOpen changes
    React.useEffect(() => {
        if (isPanelOpen) {
            setPanelSize('25%');
        } else {
            setPanelSize('0%');
        }
    }, [isPanelOpen]);

    return (
        <Splitter
            className='borde w-screen  h-screen box-border  bg-[#000] flex flex-row  text-white flex-nowrap  '
            style={Object.assign({ boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }, style)}
            {...restProps}
        >


            <Splitter.Panel collapsible max='30%' min='23%' defaultSize={'30%'}>

                <div className='h-screen overflow-hidden  py-2 pr-3 flex flex-row borde '>

                    <div className='h-full borde max-w-[4.5rem] py-2 '>
                        <div className='rounded-lg overflow-hidden borde w-full  h-full  '>
                            <LeftSideBar />
                        </div>
                    </div>

                    <div className=' overflow-hidden w-full flex flex-col rounded-lg   h-full   borde  gap-1 p-1 '>


                        <div className='flex-4 h-full  borde rounded-lg overflow-hidden borderr-green-800'>
                            <Outlet />
                        </div>

                    </div>

                </div>

            </Splitter.Panel>


            <Splitter.Panel collapsible >
                <div className='flex-1  borde  overflow-auto   h-screen borde pr-2 py-2 '>
                    <div className='h-full rounded-lg border border-1 overflow-hidden'>
                        <RightContext>
                            <Right />
                        </RightContext>
                    </div>
                </div>
            </Splitter.Panel>


            <Splitter.Panel
                collapsible
                max='35%'
                min='0%'
                size={panelSize}
                onResize={(size) => {
                    setPanelSize(size);
                    // Update context state based on size
                    if (size === '0%' || size === 0) {
                        setIsPanelOpen(false);
                    } else {
                        setIsPanelOpen(true);
                    }
                }}
            >
                <div className='overflow-auto flex-[0.4] h-screen borde p-2'>
                    <div className='rounded-lg overflow-hidden border border-white/10 h-full'>
                        <UserGroupDetails />
                    </div>
                </div>
            </Splitter.Panel>








        </Splitter>
    )
}

export default RootLayout