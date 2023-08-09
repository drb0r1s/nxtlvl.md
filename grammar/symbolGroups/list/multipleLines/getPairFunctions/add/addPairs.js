import getValidTags from "./getValidTags.js";

export default function addPairs(pairs, content, addingDifference, symbol, isInner = false) {
    let newContent = content;
    let newAddingDifference = addingDifference;

    pairs.forEach(pair => {
        const realPositions = { start: pair.start + newAddingDifference, end: pair.end + newAddingDifference };
        const innerContent = newContent.substring(realPositions.start, realPositions.end);
        const tags = getValidTags(innerContent, symbol, pair, isInner);

        newContent = newContent.substring(0, realPositions.start) + tags.opened + innerContent + newContent.substring(realPositions.end);
        newAddingDifference += tags.opened.length;

        if(pair.inner) {
            const { newContent: newContentValue, newAddingDifference: newAddingDifferenceValue } = addPairs(pair.inner, newContent, newAddingDifference, symbol, true);
        
            newContent = newContentValue;
            newAddingDifference = newAddingDifferenceValue;
        }
        
        newContent = newContent.substring(0, pair.end + newAddingDifference) + tags.closed + newContent.substring(pair.end + newAddingDifference);
        newAddingDifference += tags.closed.length;
    });

    return { newContent, newAddingDifference };
}