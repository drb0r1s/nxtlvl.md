import parseSymbolGroups from "./symbolGroups/parseSymbolGroups.js";

export default function parser(content) {
    let parsedContent = content;
    
    whitespacesConfig();
    parsedContent = parseSymbolGroups(parsedContent);

    parsedContent = parsedContent.replaceAll("<br>\n", "<br>");
    
    return parsedContent;

    function whitespacesConfig() {
        parsedContent = parsedContent.replaceAll("\n", "<br>\n");

        const regex = {
            firstLine: /^<br>\n/,
            whitespaces: /^(\s+|\t)/gm
        };

        Object.values(regex).forEach(r => { parsedContent = parsedContent.replace(r, "") });
    }
}