const StartSpaces = { count, cut };
export default StartSpaces;

function count(string) {
    let status = true;
    let counter = 0;

    while(status) {
        if(string[counter] === " ") counter++;
        else status = false;
    }

    return counter;
}

function cut(string) {
    let newString = "";
    let ignore = true;

    for(let i = 0; i < string.length; i++) {
        if(ignore && string[i] !== " ") ignore = false;
        if(!ignore) newString += string[i];
    }

    return newString;
}