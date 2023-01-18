import Syntax from "./Syntax.js";
import parseSymbolGroups from "./parseSymbolGroups/index.js";

export default function parser(content) {
    let parsedContent = content;
    whitespacesConfig();

    Object.keys(Syntax).forEach((key, index) => {
        const symbols = Object.values(Syntax)[index];
        if(Array.isArray(symbols)) symbols.forEach(symbol => { parsedContent = parseSymbolGroups(parsedContent, key, symbol) });
    });

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