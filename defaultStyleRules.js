const defaultStyleRules = {
    "nxtlvl.classic.span.%": {
        whiteSpace: "break-spaces"
    },
    
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

            "nxtlvl.h1": { display: "inline-block" }
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