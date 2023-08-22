import addLi from "./addLi.js";
import nest from "../format/nest.js";
import getTagPositions from "./getTagPositions.js";
import spaceFix from "./spaceFix.js";

const Parse = { repeat, noRepeat };
export default Parse;

function repeat(pairs, content, symbol) {
    let newContent = content;
    let contentDifference = 0;

    pairs.forEach(pair => {
        const realPositions = getRealPositions(pair);
        
        const pairContent = getPairContent(pair, realPositions);
        const spaceFixedContent = spaceFix(pairContent, symbol);

        const difference = Math.abs(pairContent.length - spaceFixedContent.length);

        if(summaryCheck(pairContent)) return;

        newContent = newContent.substring(0, realPositions.start) + spaceFixedContent + newContent.substring(realPositions.end);
        contentDifference += difference;
    });

    return newContent;

    function getPairContent(pair, realPositions) {
        const pairContent = symbol.tag === "blockquote" ? newContent.substring(realPositions.start, realPositions.end) : newContent.substring(pair.start, pair.end);
        return pairContent;
    }

    function getRealPositions(pair) {
        const realPositions = pair;

        if(symbol.tag === "blockquote") {
            realPositions.start -= contentDifference;
            realPositions.end -= contentDifference;
        }

        else {
            realPositions.start += contentDifference;
            realPositions.end += contentDifference;
        }

        return realPositions;
    }

    function summaryCheck(pairContent) {
        let result = false;
        
        const tagPositions = getTagPositions("summary", pairContent);

        if(tagPositions) {
            const afterTag = pairContent.substring(tagPositions.end);
            const summaryEnd = afterTag.indexOf("</summary>");

            const afterTagSummaryContent = afterTag.substring(0, summaryEnd);
            if(!afterTagSummaryContent.includes("< ")) result = true;
        }

        return result;
    }
}

function noRepeat(pairs, content, symbol) {
    let newContent = content;
    let addingDifference = 0;

    const formattedPairs = nest(pairs);
    const { newContent: newContentValue, newAddingDifference: newAddingDifferenceValue } = addLi(formattedPairs, newContent, addingDifference, symbol);

    newContent = newContentValue;
    addingDifference = newAddingDifferenceValue;
    
    return newContent;
}