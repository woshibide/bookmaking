/***********************************************************
            THIS IS A SCRIPT FOR INDESIGN
  maybe it works in other adobe apps, but I don't know
************************************************************/

// user is expected to highlight some text
// the script will insert two tabs:
// one tab is inserted after first character of the first line
// second tab is inserted at the beginning of the second line


if (app.documents.length > 0 && app.selection.length > 0) {
    try {
        
        var mySelection = app.selection[0];
        var myParagraph = mySelection.paragraphs[0];
        
        if (mySelection instanceof Text) {
                    
            // first tab: after first character of first line
            var firstLine = myParagraph.lines[0];
            if (firstLine.characters.length > 0) {
                firstLine.characters[0].insertionPoints[-1].contents = "\t";
            }
            
            // second tab: only at the beginning of second line
            if (myParagraph.lines.length > 1) {
                myParagraph.lines[1].insertionPoints[0].contents = "\n\t";
            }
        } else {
            alert("try BETTER selecting the text.");
        }
    } catch(e) {
        alert("PALUNDRA: " + e);
    }
} else {
    alert("open a document and select some text.");
}
