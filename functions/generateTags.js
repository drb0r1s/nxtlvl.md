import Convert from "./Convert.js";

export default function generateTags(symbol, custom) {
    const clearMd = symbol.md.replace(/\\+/g, "");
    
    const defaultClasses = {
        group: Convert.camelToKebab(symbol.group),
        tag: symbol.tag,
        md: clearMd
    };

    const classes = {...defaultClasses, ...custom};

    const classContent = `nxtlvl ${classes.group} ${classes.tag} ${classes.md}`;
    
    const tags = { opened: `<${classes.tag} class="${classContent}">`, closed: `</${classes.tag}>` };

    return tags;
}