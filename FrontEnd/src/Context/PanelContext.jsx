import React, { createContext, useContext, useState } from 'react';

const PanelContext = createContext();

export const PanelProvider = ({ children }) => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    const openPanel = () => {
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    return (
        <PanelContext.Provider value={{ isPanelOpen, setIsPanelOpen, togglePanel, openPanel, closePanel }}>
            {children}
        </PanelContext.Provider>
    );
};

export const usePanelContext = () => {
    const context = useContext(PanelContext);
    if (!context) {
        throw new Error('usePanelContext must be used within PanelProvider');
    }
    return context;
};
