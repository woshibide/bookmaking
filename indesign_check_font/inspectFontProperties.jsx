// this script lists the available properties of a character object
// to help identify how to manipulate variable font axes

(function() {
    // check if document is open
    if (app.documents.length === 0) {
        alert("please open a document first");
        return;
    }
    
    // check if text is selected
    if (app.selection.length === 0) {
        alert("please select some text first");
        return;
    }
    
    // get selection
    var selection = app.selection[0];
    
    // check if we have text selected
    if (!(selection.hasOwnProperty("contents"))) {
        alert("please select some text first");
        return;
    }
    
    // get text range
    var textRange;
    if (selection.constructor.name === "TextFrame") {
        textRange = selection.texts[0];
    } else {
        textRange = selection;
    }
    
    if (textRange.characters.length === 0) {
        alert("no characters in selection");
        return;
    }
    
    // get first character as sample
    var sampleChar = textRange.characters[0];
    
    // gather property information
    var props = [];
    for (var prop in sampleChar) {
        try {
            var value = sampleChar[prop];
            var type = typeof value;
            props.push(prop + " (" + type + ")");
        } catch (e) {
            props.push(prop + " (error accessing)");
        }
    }
    
    // sort properties alphabetically
    props.sort();
    
    // create a text file with the properties
    var file = new File("~/Desktop/character_properties.txt");
    file.open("w");
    file.write("character properties:\n\n" + props.join("\n"));
    file.close();
    
    alert("found " + props.length + " properties. list saved to desktop as 'character_properties.txt'");
    
})();