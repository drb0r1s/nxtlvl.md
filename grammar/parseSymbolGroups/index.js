import oneLine from "./groups/oneLine.js";
import multipleLines from "./groups/multipleLines.js";
import upperLine from "./groups/upperLine.js";
import classic from "./groups/classic.js";

import { SyntaxPatterns } from "../Syntax.js";

export default function parseSymbolGroups(content, symbolGroup, symbol) {
    let parsedContent = content;

    const matches = parsedContent.match(symbol.pattern);
    if(!matches) return parsedContent;
    
    const groups = { oneLine, multipleLines, upperLine, classic };
    let group = null;

    Object.keys(groups).forEach((key, index) => { if(symbolGroup === key) group = Object.values(groups)[index] });
    
    if(group) {
        const symbolGroupProps = {
            content: parsedContent,
            symbol,
            matches: SyntaxPatterns.match(parsedContent, symbolGroup, symbol)
        };

        parsedContent = group(symbolGroupProps);
    }

    return parsedContent;
}