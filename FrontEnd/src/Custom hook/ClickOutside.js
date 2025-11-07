import { useEffect } from "react";

export const useClickOutside = (clickOutsideRef, divShow, setDivShow) => {
    useEffect(() => {
        if (!divShow) return; // Don't add event listener if dropdown is closed

        

        function handleClickOutside(event) {
            if (clickOutsideRef.current && !clickOutsideRef.current.contains(event.target)) {
                setDivShow(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [divShow]); // Re-run effect when divShow changes
};
