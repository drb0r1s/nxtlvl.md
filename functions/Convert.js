import ASCII from "../data/ASCII.js";

const Convert = { camelToKebab, kebabToCamel, reverse, toASCII };

function camelToKebab(camel) {
    let kebab = "";

    for(let i = 0; i < camel.length; i++) {
        if(camel[i] === camel[i].toUpperCase() && camel[i] !== "-") kebab += `-${camel[i].toLowerCase()}`;
        else kebab += camel[i];
    }

    return kebab;
}

function kebabToCamel(kebab) {
    let camel = "";
    let upperCaseStatus = false;

    for(let i = 0; i < kebab.length; i++) {
        if(kebab[i] === "-") upperCaseStatus = true;
        
        else if(upperCaseStatus) {
            upperCaseStatus = false;
            camel += kebab[i].toUpperCase();
        }

        else camel += kebab[i];
    }

    return camel;
}

function reverse(string) {
    let reversedString = "";
    for(let i = string.length - 1; i >= 0; i--) reversedString += string[i];
    
    return reversedString;
}

function toASCII(string) {
    const characters = [...string];
    let asciiString = "";

    for(let i = 0; i < characters.length; i++) Object.keys(ASCII).forEach((key, index) => { if(key === characters[i]) asciiString += Object.values(ASCII)[index] });

    return asciiString;
}

export default Convert;