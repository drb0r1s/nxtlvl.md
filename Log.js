const logs = {
    errors: {
        invalidContentType: "Invalid content type: {type}. Content must be a string."
    },

    warns: {
        noContent: "Content is not defined.\nTo define the content you can:\n1. Provide the content as the first parameter of the NXTLVL class (new NXTLVL(content)).\n2. Provide the content as the first parameter of the md method (.md(content))."
    }
};

const Log = { error, warn };
export default Log;

function error(id, props) {
    return log("error", id, props);
}

function warn(id, props) {
    return log("warn", id, props)
}

function log(type, id, props) {
    const targetIds = type === "error" ? logs.errors : logs.warns;
    let targetValue = null;

    Object.keys(targetIds).forEach((key, index) => {
        if(id === key) targetValue = Object.values(targetIds)[index];
    });

    return logFunction(targetValue);

    function logFunction(content) {
        let validContent = content;
        const logProps = propFinder();

        if(typeof props === "string" && logProps.length === 1) validContent = validContent.replaceAll(`{${logProps[0]}}`, props);

        if(typeof props === "object") logProps.forEach(logProp => {
            let prop = "";
            
            Object.keys(props).forEach((key, index) => {
                if(logProp === key) prop = Object.values(props)[index];
            });

            if(prop) validContent = validContent.replaceAll(`{${logProp}}`, prop);
        });

        const logContent = `NTLVL.md ${type === "error" ? "Error" : "Warning"}: ${validContent}`;
        type === "error" ? console.error(logContent) : console.warn(logContent);

        const logContentHTML = logContent.replaceAll("\n", "<br>");
        return logContentHTML;
        
        function propFinder() {
            const regex = /(?<={)[a-zA-Z0-9]+(?=})/gm;
            return validContent.match(regex);
        }
    }
}