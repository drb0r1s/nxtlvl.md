import Match from "../../../../functions/Match.js";
import checkAllowedEmptyContent from "./checkAllowedEmptyContent.js";

export default function checkUnparsedClassicPair(content, symbol, pair) {
    const pairContent = content.substring(pair.start, pair.end);
    let newPairContent = "";

    const lines = pairContent.split("\n");
    const newLines = [];

    let stop = false;
    
    for(let i = lines.length - 1; i >= 0; i--) {
        const current = lines[i];
        const next = lines[i - 1];
        
        const allowedEmptyContent = {
            current: checkAllowedEmptyContent(current, symbol),
            next: checkAllowedEmptyContent(next, symbol)
        };
        
        if(!allowedEmptyContent.current) stop = true;
        
        if(!stop && (allowedEmptyContent.current && !allowedEmptyContent.next)) newLines.push(current);
        if(stop) newLines.push(current)
    }

    newLines.reverse();
    newLines.forEach((line, index) => { newPairContent += `${line}${index === newLines.length - 1 ? "\n" : "\n"}` });

    console.log(pairContent, "\n\n", newPairContent)

    const closestPairMatch = Match.closest(content, newPairContent, pair.start);
    if(closestPairMatch) return closestPairMatch.positions;
}