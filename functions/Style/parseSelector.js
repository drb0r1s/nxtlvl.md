export default function parseSelector(selector) {
    const parsedSelector = [];
    
    if(selector.length === 0) return parsedSelector;

    const multipleSelectors = selector.split(",");

    multipleSelectors.forEach(multipleSelector => {
        const convertedSelector = convertSelector(multipleSelector[0] === " " ? multipleSelector.substring(1) : multipleSelector);
        if(convertedSelector) parsedSelector.push(convertedSelector);
    });

    return parsedSelector;
}

function convertSelector(selector) {
    let convertedSelector = selector;
    
    if(convertedSelector[0] !== "." || (convertedSelector[0] === "." && convertedSelector.length === 1)) convertedSelector = "." + convertedSelector;

    const innerSelectors = convertedSelector.split(" ");
    const parsedinnerSelectors = [];

    if(innerSelectors.length > 1) innerSelectors.forEach(innerSelector => {
        if(!innerSelector) return;

        if(innerSelector[0] !== "." || (innerSelector[0] === "." && innerSelector.length === 1)) parsedinnerSelectors.push("." + innerSelector);
        else parsedinnerSelectors.push(innerSelector);
    });

    if(parsedinnerSelectors.length > 0) {
        convertedSelector = "";
        parsedinnerSelectors.forEach((parsedinnerSelector, index) => { convertedSelector += !index ? parsedinnerSelector : " " + parsedinnerSelector });
    }

    const specialSymbols = /!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|\/|\\|\<|\>|\?|,|(?<=\.)\.(?=\.|$)|;|'|"|\||:|-/gm;
    const matches = [...convertedSelector.matchAll(specialSymbols)];

    let addingDifference = 0;

    matches.forEach(match => {
        const realPosition = match.index + addingDifference;
        convertedSelector = convertedSelector.substring(0, realPosition) + "\\" + convertedSelector.substring(realPosition);

        addingDifference += "\\".length;
    });

    return convertedSelector;
}