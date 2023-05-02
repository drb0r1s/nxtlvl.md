export default function parseSelector(selector) {
    let parsedSelector = selector;

    if(parsedSelector.length === 0) return parsedSelector;
    if(parsedSelector[0] !== "." || (parsedSelector[0] === "." && parsedSelector.length === 1)) parsedSelector = "." + parsedSelector;

    const multipleSelectors = parsedSelector.split(" ");
    const parsedMultipleSelectors = [];

    if(multipleSelectors.length > 1) multipleSelectors.forEach(multipleSelector => {
        if(!multipleSelector) return;

        if(multipleSelector[0] !== "." || (multipleSelector[0] === "." && multipleSelector.length === 1)) parsedMultipleSelectors.push("." + multipleSelector);
        else parsedMultipleSelectors.push(multipleSelector);
    });

    if(parsedMultipleSelectors.length > 0) {
        parsedSelector = "";
        parsedMultipleSelectors.forEach((parsedMultipleSelector, index) => { parsedSelector += !index ? parsedMultipleSelector : " " + parsedMultipleSelector });
    }

    const specialSymbols = /!|@|#|\$|%|\^|&|\*|\(|\)|_|\+|\/|\\|\<|\>|\?|,|(?<=\.)\.(?=\.|$)|;|'|"|\||:|-/gm;
    const matches = [...parsedSelector.matchAll(specialSymbols)];

    let addingDifference = 0;

    matches.forEach(match => {
        const realPosition = match.index + addingDifference;
        parsedSelector = parsedSelector.substring(0, realPosition) + "\\" + parsedSelector.substring(realPosition);

        addingDifference += "\\".length;
    });

    return parsedSelector;
}