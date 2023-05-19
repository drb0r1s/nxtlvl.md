import escapeRegex from "./escapeRegex.js";

export default function findClosestMatch(content, match, originalMatchPosition) {
    const matches = [...content.matchAll(escapeRegex(match))];
    let closestMatch = matches[0];

    if(matches.length > 1) for(let i = 1; i < matches.length; i++) {
        const difference = Math.abs(originalMatchPosition - matches[i].index);
        const currentDifference = Math.abs(originalMatchPosition - closestMatch.index);

        if(difference < currentDifference) closestMatch = matches[i];
        else if((originalMatchPosition > closestMatch.index) && (originalMatchPosition < matches[i].index)) closestMatch = matches[i];
    }

    return closestMatch;
}