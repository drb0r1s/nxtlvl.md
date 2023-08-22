import Remove from "../../Remove.js";
import generateTags from "../../../../../../functions/generateTags.js";
import addLi from "./addLi.js";
import nest from "../format/nest.js";
import getTagPositions from "./getTagPositions.js";
import spaceFix from "./spaceFix.js";

const Parse = { blockquote, details, list };
export default Parse;

function blockquote(pairs, content, symbol) {
    let newContent = content;
    let removingDifference = 0;
    
    pairs.forEach(pair => {
        const realPositions = { start: pair.start - removingDifference, end: pair.end - removingDifference };

        const pairContent = newContent.substring(realPositions.start, realPositions.end);
        const spaceFixedContent = spaceFix(pairContent, symbol);

        const difference = Math.abs(pairContent.length - spaceFixedContent.length);
        
        newContent = newContent.substring(0, realPositions.start) + spaceFixedContent + newContent.substring(realPositions.end);
        removingDifference += difference;
    });

    return newContent;
}

function details(pairs, content, symbol) {
    let newContent = content;
    let addingDifference = 0;
    let asciiStatus = false;

    pairs.forEach(pair => {
        const pairContent = content.substring(pair.start, pair.end);
        const spaceFixedContent = spaceFix(pairContent, symbol);

        const tagPositions = getTagPositions("summary", pairContent);

        if(tagPositions) {
            const afterTag = pairContent.substring(tagPositions.end);
            const summaryEnd = afterTag.indexOf("</summary>");

            const afterTagSummaryContent = afterTag.substring(0, summaryEnd);
            if(!afterTagSummaryContent.includes("< ")) return;
        }

        const difference = Math.abs(pairContent.length - spaceFixedContent.length);
        const realPositions = { start: pair.start + addingDifference, end: pair.end + addingDifference };

        newContent = newContent.substring(0, realPositions.start) + spaceFixedContent + newContent.substring(realPositions.end);
        addingDifference += difference;
    });

    return newContent;
}

function list(pairs, content, symbol) {
    let newContent = content;
    let addingDifference = 0;

    const formattedPairs = nest(pairs);
    const { newContent: newContentValue, newAddingDifference: newAddingDifferenceValue } = addLi(formattedPairs, newContent, addingDifference, symbol);

    newContent = newContentValue;
    addingDifference = newAddingDifferenceValue;
    
    return newContent;
}