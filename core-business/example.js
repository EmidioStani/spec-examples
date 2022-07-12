/**
 * Fills in the direct input area with some samples
 * @param {string} file - file containing the sample
 */
 function loadFile(editorinstance, file) {
    var xmlhttp;
    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status !== 200) {
            alert('Error when opening the file: ' + file + ' - ' + xmlhttp.status + ' ' + xmlhttp.statusText);
        } else if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            editorinstance.setValue(xmlhttp.responseText);
        }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    return xmlhttp.responseText;
}

(document).ready(function () {

    editortab1 = CodeMirror.fromTextArea(document.getElementById("tab1validationquery"), {
        mode: "turtle",
        lineNumbers: true
    });

    editortab2 = CodeMirror.fromTextArea(document.getElementById("tab2validationquery"), {
        mode: "javascript",
        lineNumbers: true
    });

    // tabs creation needs to be after codemirror otherwise the gutter (rulers) is flat
    $("#tabs").tabs();

    loadFile(editortab1, "./example.ttl");
    loadFile(editortab2, "./example.jsonld");


});