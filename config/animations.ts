export const liquidVariants = {
    // Dropdowns and Menus (Origin top)
    menu: {
        hidden: {
            opacity: 0,
            scale: 0.92,
            y: -8,
            filter: "blur(4px)",
            transition: { duration: 0.2 }
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                stiffness: 450,
                damping: 35,
                mass: 0.8
            }
        },
        exit: {
            opacity: 0,
            scale: 0.96,
            y: -4,
            filter: "blur(2px)",
            transition: { duration: 0.15, ease: "easeOut" }
        }
    },

    // Modals (Center screen)
    modal: {
        hidden: {
            opacity: 0,
            scale: 0.9,
            y: 20,
            filter: "blur(8px)"
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            filter: "blur(0px)",
            transition: {
                type: "spring",
                stiffness: 380,
                damping: 28,
                mass: 1
            }
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            y: 10,
            filter: "blur(4px)",
            transition: { duration: 0.2 }
        }
    },

    // Mobile Slide-overs (Sidebars)
    slideUp: {
        hidden: { y: "100%", opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 350, damping: 30 }
        },
        exit: {
            y: "100%",
            opacity: 0,
            transition: { duration: 0.2, ease: "easeIn" }
        }
    },

    // Staggered Children for lists
    container: {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { staggerChildren: 0.02, staggerDirection: -1 }
        }
    },

    item: {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 500, damping: 30 }
        },
        exit: { opacity: 0, y: 5 }
    }
};
