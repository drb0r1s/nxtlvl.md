const defaultStyleRules = {
    "nxtlvl.h1": {
        borderBottom: "1px solid #cccccc",
        marginBottom: "30px",
        paddingBottom: "10px"
    },

    "nxtlvl.h2": {
        borderBottom: "1px solid #cccccc",
        marginBottom: "20px",
        paddingBottom: "5px"
    },

    "nxtlvl.h3": { marginBottom: "15px" },
    "nxtlvl.h4": { marginBottom: "10px" },
    "nxtlvl.h5": { marginBottom: "5px" },

    "nxtlvl.pre.@": { fontFamily: "monospace" },
    
    "nxtlvl.classic.span.%": { whiteSpace: "break-spaces" },
    
    "nxtlvl.blockquote.>": {
        backgroundColor: "#f9f9f9",
        borderLeft: "10px solid #cccccc",
        margin: "5px 10px",
        padding: "5px 10px",
    },

    "nxtlvl.details.<": {
        backgroundColor: "#f9f9f9",
        borderLeft: "5px solid #cccccc",
        listStylePosition: "inside",
        margin: "5px 10px",
        padding: "5px 10px",

        "nxtlvl.summary.<": {
            cursor: "pointer",
            userSelect: "none",

            "nxtlvl.h1, nxtlvl.h2, nxtlvl.h3, nxtlvl.h4, nxtlvl.h5, nxtlvl.h6": { display: "inline-block" },
            
            "nxtlvl.h1, nxtlvl.h2": {
                borderBottom: "none",
                marginBottom: "0",
                paddingBottom: "0"
            }
        },
    },

    "nxtlvl.multiple-lines.ol": {
        listStyleType: "decimal",
        listStylePosition: "inside",
        margin: "5px 0px 5px 20px"
    },

    "nxtlvl.multiple-lines.ul": {
        listStyleType: "revert",
        listStylePosition: "inside",
        margin: "5px 0px 5px 20px"
    }
};

export default defaultStyleRules;