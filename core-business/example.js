function example_structure(exampleid){
	structure=`
	<div id="` + exampleid + `-tabs" class="tabs">
		<ul>
			<li><a href="#` + exampleid + `-tabs-1">Turtle</a></li>
			<li><a href="#` + exampleid + `-tabs-2">JSON-LD</a></li>
		</ul>
		<div id="` + exampleid + `-tabs-1">
			<textarea class="validationquery" id="` + exampleid + `-tab1validationquery" name="query" cols="80" rows="16"></textarea>
			<button class="buttonsample copyturtletoclipboard" id="` + exampleid + `-tabs-1-button-1">Copy</button>
		</div>
		<div id="` + exampleid + `-tabs-2">
			<textarea class="validationquery" id="` + exampleid + `-tab2validationquery" name="query" cols="80" rows="16"></textarea>
			<button class="buttonsample copyjsonldtoclipboard" id="` + exampleid + `-tabs-2-button-1">Copy</button>
			<button class="buttonsample openinplayground" id="` + exampleid + `-tabs-2-button-2">Open in Playground</button>
		</div>
	</div>`;
	return structure;
}

function hoverWidgetOnOverlay(cm, overlayClass, widget) {
    cm.addWidget({line:0, ch:0}, widget, true);
    widget.style.position = 'fixed';
    widget.style.zIndex=100000;
	widget.style.backgroundColor = "red";
    widget.style.top=widget.style.left='-1000px'; // hide it 
    widget.dataset.token=null;

    cm.getWrapperElement().addEventListener('mousemove', e => {
        let onToken=e.target.classList.contains("cm-"+overlayClass), onWidget=(e.target===widget || widget.contains(e.target));

        if (onToken && e.target.innerText!==widget.dataset.token) { // entered token, show widget
            var rect = e.target.getBoundingClientRect();
            widget.style.left=rect.left+'px';
            widget.style.top=rect.bottom+'px';
            //let charCoords=cm.charCoords(cm.coordsChar({ left: e.pageX, top:e.pageY }));
            //widget.style.left=(e.pageX-5)+'px';  
            //widget.style.top=(cm.charCoords(cm.coordsChar({ left: e.pageX, top:e.pageY })).bottom-1)+'px';

            widget.dataset.token=e.target.innerText;
            if (typeof widget.onShown==='function') widget.onShown();

        } else if ((e.target===widget || widget.contains(e.target))) { // entered widget, call widget.onEntered
            if (widget.dataset.entered==='true' && typeof widget.onEntered==='function')  widget.onEntered();
            widget.dataset.entered='true';

        } else if (!onToken && widget.style.left!=='-1000px') { // we stepped outside
            widget.style.top=widget.style.left='-1000px'; // hide it 
            delete widget.dataset.token;
            widget.dataset.entered='false';
            if (typeof widget.onHidden==='function') widget.onHidden();
        }

        return true;
    });
}

function hyperlinkOverlay(cm) {
    if (!cm) return;
    
    const rx_word = "\" <>"; // Define what separates a word

    function isUrl(s) {
        if (!isUrl.rx_url) {
            // taken from https://gist.github.com/dperini/729294
            isUrl.rx_url=/^(?:(?:https?|ftp):\/\/)?(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
            // valid prefixes
            isUrl.prefixes=['http:\/\/', 'https:\/\/', 'ftp:\/\/', 'www.'];
            // taken from https://w3techs.com/technologies/overview/top_level_domain/all
            isUrl.domains=['com','ru','net','org','de','jp','uk','br','pl','in','it','fr','au','info','nl','ir','cn','es','cz','kr','ua','ca','eu','biz','za','gr','co','ro','se','tw','mx','vn','tr','ch','hu','at','be','dk','tv','me','ar','no','us','sk','xyz','fi','id','cl','by','nz','il','ie','pt','kz','io','my','lt','hk','cc','sg','edu','pk','su','bg','th','top','lv','hr','pe','club','rs','ae','az','si','ph','pro','ng','tk','ee','asia','mobi'];
        }

        if (!isUrl.rx_url.test(s)) return false;
        for (let i=0; i<isUrl.prefixes.length; i++) if (s.startsWith(isUrl.prefixes[i])) return true;
        for (let i=0; i<isUrl.domains.length; i++) if (s.endsWith('.'+isUrl.domains[i]) || s.includes('.'+isUrl.domains[i]+'\/') ||s.includes('.'+isUrl.domains[i]+'?')) return true;
        return false;
    }

    cm.addOverlay({
        token: function(stream) {
            let ch = stream.peek();
            let word = "";

            if (rx_word.includes(ch) || ch==='\uE000' || ch==='\uE001') {
                stream.next();
                return null;
            }

            while ((ch = stream.peek()) && !rx_word.includes(ch)) {
                word += ch;
                stream.next();
            }

            if (isUrl(word)) return "url"; // CSS class: cm-url
        }}, 
        { opaque : true }  // opaque will remove any spelling overlay etc
    );

    let widget=document.createElement('button');
    widget.innerHTML='&rarr;'
    widget.onclick=function(e) { 
        if (!widget.dataset.token) return;
        let link=widget.dataset.token;
        if (!(new RegExp('^(?:(?:https?|ftp):\/\/)', 'i')).test(link)) link="http:\/\/"+link;
        window.open(link, '_blank'); 
        return true;
    };
    hoverWidgetOnOverlay(cm, 'url', widget);
}


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

function createTurtleEditorFrom(selector) {
  return CodeMirror.fromTextArea(selector, {
    mode: "turtle",
    lineNumbers: true
  });
}

function createJSONLDEditorFrom(selector) {
  return CodeMirror.fromTextArea(selector, {
    mode: "application/ld+json",
    lineNumbers: true
  });
}


$(document).ready(function () {

	
	
	var examples = [];
	var editors = [];

	$("#examples h3").each(function(index){
		exampleid = this.id;
		examples.push(exampleid); 
		var text = example_structure(exampleid);
		$(this).after(text);

		var obj = {CM0: createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery")), CM1: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery"))};
		editors[index] = obj;
		//editors[index].push({CM: createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery")}, CM2: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery")});
		//editors[index].push({CM: createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery")});
		//editors[index][0] = createTurtleEditorFrom(document.getElementById(exampleid + "-tab1validationquery"));
		//editors[index][1] = createJSONLDEditorFrom(document.getElementById(exampleid + "-tab2validationquery"));

		$("#" + exampleid + "-tabs").tabs();

		$("#" + exampleid + "-tabs a").on('click', function(e) {
			$('.CodeMirror').each(function(i, el){
				el.CodeMirror.refresh();
			});
		});

		loadFile(editors[index].CM0, "http://localhost:8090/core-business/examples/" + exampleid + ".ttl");
		loadFile(editors[index].CM1, "http://localhost:8090/core-business/examples/" + exampleid + ".jsonld");
		
		hyperlinkOverlay(editors[index].CM0);
		hyperlinkOverlay(editors[index].CM1);

	});

	$("button.copyturtletoclipboard").on({
		"click": function() {
			var index = $("#examples").children(".tabs").index($(this).parent().parent());
			texttocopy = editors[index].CM0.getValue()
			navigator.clipboard.writeText(texttocopy);
			$(this).tooltip({ items: "#" + this.id, content: "Copied !"});
			$(this).tooltip("open");
		},
		"mouseout": function() {
			$(this).tooltip("disable");
		}
	});
	$("button.copyjsonldtoclipboard").on({
		"click": function() {
			var index = $("#examples").children(".tabs").index($(this).parent().parent());
			texttocopy = editors[index].CM1.getValue();
			navigator.clipboard.writeText(texttocopy);
			$(this).tooltip({ items: "#" + this.id, content: "Copied !"});
			$(this).tooltip("open");
		},
		"mouseout": function() {
			$(this).tooltip("disable");
		}
	});
	$("button.openinplayground").on('click', function(e) {
		var index = $("#examples").children(".tabs").index($(this).parent().parent());
		newUrl = "https://json-ld.org/playground/#startTab=tab-expand&json-ld=" + editors[index].CM1.getValue(); 
		window.open(encodeURI(newUrl), '_blank');
		return false;
	});
	
	$("div.CodeMirror pre").on('click', function(e) {
		var et = $(e.target);
		if(et.hasClass('cm-url'))  {
			newUrl = $(this).text();
			window.open(encodeURI(newUrl), '_blank');
			return false;
		}
	});
});

