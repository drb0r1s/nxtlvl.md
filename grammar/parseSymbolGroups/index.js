import oneLine from "./groups/oneLine.js";
import upperLine from "./groups/upperLine.js";
import classic from "./groups/classic.js";

export default function parseSymbolGroups(content, symbolGroup, symbol) {
    let parsedContent = content;
    
    const groups = { oneLine, upperLine, classic };
    let group = null;

    Object.keys(groups).forEach((key, index) => { if(symbolGroup === key) group = Object.values(groups)[index] });
    if(group) parsedContent = group(parsedContent, symbol);

    return parsedContent;
}