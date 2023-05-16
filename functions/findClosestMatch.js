import escapeRegex from "./escapeRegex.js";

export default function findClosestMath(content, match) {
    const matches = [...content.matchAll(escapeRegex(match))];
    let closestMatch = matches[0];

    if(matches.length > 1) for(let i = 1; i < matches.length; i++) {
        const difference = Math.abs(pair.start - matches[i].index);
        const currentDifference = Math.abs(pair.start - closestMatch.index);

        if(difference < currentDifference) closestMatch = matches[i];
        else if((pair.start > closestMatch.index) && (pair.start < matches[i].index)) closestMatch = matches[i];
    }

    return closestMatch;
}