import Match from "../../../../../../functions/Match.js";
import getTagPositions from "./getTagPositions.js";

export default function getDoubleParsing(content, symbol) {
    let pairs = [];

    const pattern = `<${symbol.tag} class=\"nxtlvl multiple-lines.+\">|<\/${symbol.tag}>`;
    const regex = new RegExp(pattern, "gm");

    const matches = Match.all(content, regex);

    matches.forEach((match, index) => {
        const type = match.content.includes("class") ? "opened" : "closed";
        const positions = match.positions;
        
        if(symbol.tag === "details" && type === "opened") {
            const tagPositions = getTagPositions(symbol.tag, match.content);
            const detailsInSummary = isDetailsInSummary(tagPositions, match.content);
            
            if(!detailsInSummary) {
                const tag = match.content.substring(tagPositions.start, tagPositions.end);

                const contentDifference = Math.abs(match.content.length - tag.length - 1);
                positions.end -= contentDifference;
            }
        }
    
        if(!index && type === "closed") return;

        if(type === "opened") pairs.push({ start: positions.end, end: -1 });
        if(type === "closed") closePair(positions);
    });

    return pairs;

    function closePair(positions) {
        let stop = false;
        
        for(let i = pairs.length - 1; i >= 0; i--) if(!stop && pairs[i].end === -1) {
            stop = true;
            pairs[i].end = positions.start;
        }
    }

    function isDetailsInSummary(tagPositions, content) {
        let result = false;
        
        const afterFirstTag = content.substring(tagPositions.end);
        const summaryTagPositions = getTagPositions("summary", afterFirstTag);

        if(summaryTagPositions) {
            const afterSummary = afterFirstTag.substring(summaryTagPositions.end);
            if(afterSummary.startsWith("<details class=\"nxtlvl multiple-lines")) result = true;
        }

        return result;
    }
}