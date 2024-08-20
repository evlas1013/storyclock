var totalTimeSeconds = 240;
var degreesPerSecond = 360/totalTimeSeconds;
var c = document.getElementById("myCanvas");
c.visibility = "visible";
var defaultWidth = {'x':1080,'y':1080};
var extraWidth = {'x':1920, 'y':1080};
var canvasWidth = c.width;
var ctx = c.getContext("2d");
var radius = 150; // Arc radius
var textRadius = 160;
var taperMultiplier = 275;
var isPercentage = false;
var centerX = defaultWidth['x']/2;
var centerY = defaultWidth['y']/2;
var tickLength = 20;
var numberOfTickMarks = 24;
var defaultAuthor = "Greaty McAuthorson";
var defaultTitle = "A Perfect Screenplay";
document.getElementById("project").value = defaultTitle;
document.getElementById("author").value = defaultAuthor;
document.getElementById("canvas_div").style.visibility = "visible"
var backgroundImage = document.getElementById("backgroundImage");
var textColor = "Black";
var clockColor = "Black";
var backgroundColor = "white";
var eventDict ={};
var linkDict = {};
var darkMode = false;
var defaultActColor = "Black";
var defaultSeqColor = "Black";
var textHeight = 16;
var clockStarted = false;
var sortAsc = false;
var omitEndCredits = false;
var drawActAreas = false;

var rItems = [];
var gItems = [];
var bItems = [];
var cItems = [];
var mItems = [];
var yItems = [];
var kItems = []; 

var actColor = defaultActColor;
var seqColor = defaultSeqColor;
var queryParams = window.location.search;
const urlParams = new URLSearchParams(queryParams);
var fromQuery = false;
var startTime;
var timerInterval;
var autoupdateRuntime = false;

function resetLinkArrays()
{
	rItems = [];
	gItems = [];
	bItems = [];
	cItems = [];
	mItems = [];
	yItems = [];
	kItems = []; 
	actItems = []; 
}
function displayElapsedTime(timeStamp){	
	if (clockStarted)
	{	
		var currentTime = new Date();
		timeStamp = currentTime;
		var elapsedTime = parseInt((currentTime - startTime)/1000);
		document.getElementById("event_sec").value = elapsedTime;
		if (autoupdateRuntime)
		{
			totalTimeSeconds = previousTime + elapsedTime;
			displayRuntime();
			updateRuntime();	
			draw();			
		}
		window.requestAnimationFrame(displayElapsedTime);
	} else {
		return;
	}	
}



if (urlParams.get('loadSaved') != null)
{
	var savedClock = urlParams.get('loadSaved')
	load(savedClock);
	document.getElementById('savedClock').value = savedClock;
}else if (urlParams.get('fromQuery'))
{
	loadFromQuery(urlParams);
}else{	
	storyStructure();
}

function draw(){
	//console.log("Draw Called");
	//draw the background white so we can save the png
	if (document.getElementById("canvas_div").style.visibility == "visible")
	{
		if(document.getElementById("widen").checked)
		{
			c.width = extraWidth['x'];
			c.height = extraWidth['y'];
			centerX = extraWidth['x']/2;
			centerY = extraWidth['y']/2;
		}else{
			c.width = defaultWidth['x'];
			c.height = defaultWidth['y'];
			centerX = defaultWidth['x']/2;
			centerY = defaultWidth['y']/2;
		}
		ctx.clearRect(0,0,c.width, c.height);
		ctx.fillStyle = backgroundColor;
		ctx.rect(0,0,c.width, c.height)	
		ctx.fill();
		
		//draw the background paper
		if(document.getElementById("useBackground").checked)
		{		
			ctx.drawImage(backgroundImage,0,0);
		}
		
		if (!fromQuery)
		{
			saveHeader();
		}
		if (omitEndCredits && eventDict["EndCredits"] != null)
		{
			totalTimeSeconds = eventDict["EndCredits"];
			displayRuntime();
			setDegreesPerSecond();
		}
		drawClock();
		drawEvents();
		writeValuesToTable();
	}
	displayRuntime();
	document.getElementById("loadButton").style.visibility = "hidden";
	

}

function toggleDarkMode()
{
	if(document.getElementById("darkMode").checked)
	{
		backgroundImage = document.getElementById("slate");
		textColor = "white";
		clockColor = "white";
		backgroundColor = "#283137";
		darkMode = true;
		actColor = "white";
		seqColor = "white";
	}
	else
	{
		backgroundImage = document.getElementById("backgroundImage");
		textColor = "Black";
		clockColor = "Black";
		backgroundColor = "white";
		darkMode = false;
		actColor = defaultActColor;
		seqColor = defaultSeqColor;
	}
	draw();
}

function drawClock()
{
	var startAngle;
	var endAngle;
	
	//draw act areas behind the lines
	if(drawActAreas){
		//first act
		ctx.beginPath();
		ctx.fillStyle = "lightcoral";
		startAngle = -.5*Math.PI; // Starting point on circle
		endAngle = 1.309-(.5*Math.PI); // End point on circle
		ctx.arc(centerX, centerY, radius, startAngle, endAngle);
		ctx.lineTo(centerX, centerY);
		ctx.fill();
		
		
		//2nd act
		ctx.beginPath();
		ctx.fillStyle = "lightgreen";
		startAngle = endAngle;
		endAngle = 4.97-(.5*Math.PI); // End point on circle
		ctx.arc(centerX, centerY, radius, startAngle, endAngle);
		ctx.lineTo(centerX, centerY);
		ctx.fill();
		
		//3rd act
		ctx.beginPath();
		ctx.fillStyle = "lightblue";
		startAngle = endAngle;
		endAngle = 1.5*Math.PI; // End point on circle
		ctx.arc(centerX, centerY, radius, startAngle, endAngle);
		ctx.lineTo(centerX, centerY);
		ctx.fill();
		
	}
	
	ctx.lineWidth = 3;
	ctx.strokeStyle = clockColor;
	startAngle = 0; // Starting point on circle
	endAngle = Math.PI*4; // End point on circle
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);		
	//ctx.fill();
	ctx.stroke();
	ctx.fillStyle = textColor;
	ctx.font = "bold 48px Futura PT, Trebuchet MS, sans-serif";
	ctx.textAlign = "center";
	ctx.fillText(document.getElementById("project").value, centerX, 50);
	ctx.font = "bold 18px Courier New, monospace";
	ctx.fillText(document.getElementById("author").value.toUpperCase(), centerX, 75);
	//ctx.font = "bold small-caps 36px Futura PT, Trebuchet MS, sans-serif";
	//ctx.fillText("Storyclock Me", c.width/2, c.height-45);
	ctx.font = "16px Futura PT, Trebuchet MS, sans-serif";
	ctx.fillText("Create your own at storyclock.me", c.width/2, c.height-25);
	
	
	//draw the indicators		
	for ( var i = 0; i < numberOfTickMarks; i++ )
	{
		var angle = 360 / numberOfTickMarks * i;		
		var radians = (angle-90) * Math.PI / -180;
		var xStart = (radius + tickLength/2) * Math.cos(radians) + centerX;
		var yStart = -1 * (radius + tickLength/2) * Math.sin(radians) + centerY;
		var xEnd = (radius) * Math.cos(radians) + centerX;
		var yEnd = -1 * (radius) * Math.sin(radians) + centerY;
		ctx.lineWidth = 1;
		if(angle % 90 == 0)
		{
			ctx.lineWidth = 5;
			xEnd = (radius - tickLength) * Math.cos(radians) + centerX;
			yEnd = -1 * (radius - tickLength) * Math.sin(radians) + centerY;
		}
		ctx.strokeStyle = clockColor;
		ctx.beginPath();
		ctx.moveTo(xStart, yStart);
		ctx.lineTo(xEnd, yEnd);		
		ctx.stroke();		
	}
	ctx.lineWidth = 1;	
}

function startClocking(){
	startTime = new Date();
	clockStarted = !clockStarted;
	document.getElementById("start_clocking").innerHTML = clockStarted ? "Stop Clocking" : "Start Clocking";	
	document.getElementById("start_clocking").style = clockStarted ? "background-color: red;" : "background-color: green;";	
	displayElapsedTime();
}

function submit(){
	validateRuntime();
	validateEvent();
	totalTimeSeconds = parseInt(document.getElementById("runtime_mins").value) * 60 + parseInt(document.getElementById("runtime_secs").value);
	degreesPerSecond = 360/totalTimeSeconds;
	var eventTimeInSecs = currentEventTime();
	if(eventDict[eventTimeInSecs] == null)
	{
		eventDict[eventTimeInSecs] = {title: document.getElementById("event_name").value};
	} else
		eventDict[eventTimeInSecs].title = document.getElementById("event_name").value;
	document.getElementById("event_name").value = "";
	document.getElementById("event_name").placeholder = "Add New Event";
	document.getElementById("event_min").placeholder = 'MM';
	document.getElementById("event_sec").placeholder = 'SS';
	eventDict["runtime"] = totalTimeSeconds;

	draw();
}

function currentEventTime()
{
	return parseInt(document.getElementById("event_min").value) * 60 + parseInt(document.getElementById("event_sec").value);
}

function quickAdd(inEvent)
{
	document.getElementById("event_name").value = inEvent;
	switch(inEvent)
		{
			case "End Credits":
				eventDict["EndCredits"] = currentEventTime();
				break;
		}
	submit();
}

function drawEvents()
{
	var crossed180 = false;
	totalTimeSeconds = omitEndCredits ? eventDict["EndCredits"] : eventDict["runtime"];
	setDegreesPerSecond();
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
	var previousY = - 1;
	var angle;
	resetLinkArrays();
	for (var key in eventDict)		
	{	
		ctx.font = "14px monospace";
		//mathy stuff
		if(isNaN(key))
			continue;
		
		angle = key * degreesPerSecond;		
		var coords = getXY(key, textRadius, true, previousY, crossed180);		
		var xPos = coords['x'];
		var yPos = coords['y'];
		var eventObject = eventDict[key];
		var text = eventObject.title;
		
		if(eventObject.isRed)
			rItems.push(key)

		if(eventObject.isGreen)
			gItems.push(key)
		
		if(eventObject.isBlue)
			bItems.push(key)

		if(eventObject.isCyan)
			cItems.push(key)

		if(eventObject.isMagenta)
			mItems.push(key)

		if(eventObject.isYellow)
			yItems.push(key)

		if(eventObject.isBlack)
			kItems.push(key)
		
		//adjust spacing so words don't run over eachother
		var pageNumber = key/60;
		pageNumber = Math.floor(pageNumber) + 1;
		if (angle < 180)
		//we're on the right side of the clock			
		{
			if (document.getElementById("includeTimes").checked)
				text += " ("+key+"s - P"+pageNumber+")"; 
			
		}else{
		//we're on the left side of the clock			
			
			if (document.getElementById("includeTimes").checked)
				text = "("+key+"s - P"+pageNumber+") " + text;				
		}
		
		//draw the connector lines
		var endCoords = getXY(key, textRadius -10, true, previousY, crossed180);
		previousY = endCoords['y'];
		var startCoords = getXY(key, -10, false, -1, crossed180);
		var lineEndX = endCoords['x'];
		var lineEndY = endCoords['y'];
		var lineStartX = startCoords['x'];
		var lineStartY = startCoords['y'];
		ctx.strokeStyle = clockColor;
		if(eventObject.isAct)
		{
			ctx.lineWidth = 2;
		} else {
			ctx.lineWidth = 1;
		}
		ctx.beginPath();
		ctx.moveTo(lineStartX, lineStartY);
		ctx.lineTo(lineEndX, lineEndY);		
		ctx.stroke();
		
		//draw the text

		ctx.fillStyle = textColor;		
		ctx.fillText(text, xPos, yPos);
		if(angle >= 180)
			crossed180 = true;
		
	}
	drawLinks();
}

function load(inSavedClockId)
{
	document.getElementById("canvas_div").style.visibility = "visible";
	fromQuery = false;
	if(inSavedClockId == null)
		{
			inSavedClockId = document.getElementById('savedClock').value;
		}
	switch (inSavedClockId)
	{
		case "none":
			reset();
			document.getElementById("canvas_div").style.visibility = "hidden";
			break;
			
		case "theGoodPlace":
			theGoodPlace();
			break;
		
		case "storyStructure":
			storyStructure();
			break;
		
		case "superstore":
			superstore();
			break;
			
		case "betterOffTed":
			betterOffTed();
			break;
			
		case "elf":
			elf();
			break;
		
		case "pilotStructure":
			pilotStructure();
			break;
	}
	writeValuesToTable();
}

function pilotStructure()
{
	reset();
	eventDict = 
	{
		"0": {
			"title": "FORMING: Cold Open / Introduce Setting",
			"isAct": true
		},
		"30": {
			"title": "Meet Character 1"
		},
		"60": {
			"title": "Meet Character 2"
		},
		"90": {
			"title": "Meet Character 3"
		},
		"120": {
			"title": "Meet Character 4",
		},
		"150": {
			"title": "Introduce \"A\" Plot"
		},
		"190": {
			"title": "Opening Credits",
			"isAct": true
		},
		"210": {
			"title": "STORMING: Set up character dynamics",
			"isAct": true
		},
		"270": {
			"title": "B Plot Begins"
		},
		"330": {
			"title": "Set the stakes. We're a team now."
		},
		"450": {
			"title": "First team challenge. Failure."
		},
		"520": {
			"title": "NORMING: Begin reconcile differences",
			"isAct": true
		},
		"660": {
			"title": "Second Challenge: Better but not there yet"
		},
		"800": {
			"title": "Individual relationships strengthen"
		},
		"950": {
			"title": "Performing: Acknowledge roles and function together",
			"isAct": true
		},
		"1090": {
			"title": "Final Test: The team succeeds",
			"isAct": true
		},
		"1255": {
			"title": "Can't wait to do it again",
			"isAct": true
		},
		"runtime": 1320,
		"project": "Pilot Outline",
		"author": "Greaty McAuthorson"
	}
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
	draw();
}
function storyStructure()
{
	reset();
	eventDict = 
	{
		0: {title: "Act 1 - Normal World", isBlue: true, isAct: true},
		5: {title: "Opening Image"},
		15: {title: "Normalcy", isGreen: true},
		20: {title: "Normalcy Disrupted"},
		30: {title: "Herald"},
		35: {title: "Rational Approach & Failure", isRed: true},
		43: {title: "Acceptance & Departure", isGreen: true},
		50: {title: "Act 2 - New World", isBlue: true, isAct: true},
		55: {title: "B Story Begins"},
		75: {title: "Journey to Solution (Trailer Moments)", isRed: true},
		100: {title: "Tiny Breakthrough!", isGreen: true},
		120: {title: "Arrival at Solution", isRed: true},
		140: {title: "Shadow Gains Upper Hand", isGreen: true},
		150: {title: "Hero's Final Push"},
		165: {title: "Worst Fears Realized", isRed: true},
		175: {title: "Game Over", isGreen: true},
		185: {title: "Big Breakthrough & Rebirth", isRed: true},
		190: {title: "Act 3 - New Normal", isBlue: true, isAct: true},
		205: {title: "Hero Gains Upper Hand", isGreen: true, isRed: true},
		210: {title: "Shadow's Final Push"},
		225: {title: "New Normalcy", isGreen: true},
		235: {title: "Final Image"},
		"project": defaultTitle, 
		"author": defaultAuthor
	};
	totalTimeSeconds = 240;
	setDegreesPerSecond();
	document.getElementById("project").value = defaultTitle;
	document.getElementById("author").value = defaultAuthor;
	displayRuntime();
	eventDict["runtime"] = totalTimeSeconds;
	draw();
}

function setDegreesPerSecond()
{
	degreesPerSecond = 360/totalTimeSeconds;
}

function theGoodPlace()
{
	reset();
	eventDict = {
		6:   {title:"Meet Elenor", isBlue: true},
		18:  {title:"Meet Michael"},
		40:  {title:"You are dead", isBlue: true},
		60:  {title:"How Elenor Died", isBlue: true},
		120: {title:"Doug got it right", isRed: true},
		180: {title:"You are in the good place", isBlue: true, isRed: true},
		195: {title:"Title Card - Welcome to the neighborhood", isAct: true},
		255: {title:"Orientation - How points work", isRed: true},
		360: {title:"Elenor feeling guilty", isBlue: true},
		390: {title:"Who Elenor is supposed to be", isBlue: true},
		470: {title:"Meet Chidi", isMagenta: true, isAct: true},
		540: {title:"Promise you will stay with me", isMagenta: true},
		560: {title:"I am not supposed to be here", isBlue: true},
		600: {title:"No Swearing Allowed", isRed: true},
		675: {title:"Meet Janet"},
		720: {title:"Meet Tahani and Jianu"},
		765: {title:"Jianu Does not Speak"},
		810: {title:"Party Scene", isRed: true, isAct: true},
		830: {title:"Elenor Bad Person Flashback", isBlue: true},
		865: {title:"Michael Toast"},
		930: {title:"Elenor eats all the shrimp", isBlue: true},
		960: {title:"Elenor Mocks Tahani", isBlue: true},
		990: {title:"Elenor Drunk"}, isBlue: true,
		1020:{title:"Elenor Apologize to Chidi", isBlue: true, isMagenta: true},
		1110:{title:"You are a good person}, Chidi", isMagenta: true},
		1190:{title:"Destruction", isRed: true, isAct: true},
		1230:{title:"This is all your fault"},
		1320:{title:"Teach me how to be good", isBlue: true, isMagenta: true},
		"project": "The Good Place - Pilot",
		"author": "Michael Schur"
	};
	
	totalTimeSeconds = 1330;
	setDegreesPerSecond();
	document.getElementById("project").value = "The Good Place - Pilot";
	document.getElementById("author").value = "Michael Schur";
	displayRuntime();
	eventDict["runtime"] = totalTimeSeconds;
	draw();
}

function betterOffTed()
{
	reset();
	eventDict = {
		"0"   : {title: "Veridian Dynamics Commercial"},
		"50"  : {title: "Meet Ted/Veronica - Mouse Project"},
		"110" : {title: "We want to weaponize a Pumpkin"},
		"140" : {title: "Pumpkin Meeting - Meet the team"},
		"190" : {title: "Veronica inquires about fabric", isRed:true},
		"210" : {title: "Lem & Phil Bathroom Geniuses"},
		"275" : {title: "Ted proposes office chair idea", isRed:true},
		"310" : {title: "Product Testing - Linda", isRed:true},
		"345" : {title: "Stealing Creamer / Analyzing the Data", isRed:true, isGreen: true},
		"405" : {title: "Chair Launch Party", isRed:true},
		"430" : {title: "Veronica notices creamer usage", isGreen: true},
		"455" : {title: "We want to freeze Phil", isBlue: true, isAct: true},
		"530" : {title: "Ted gets data on freezing Phil / Linda's book", isBlue: true},
		"600" : {title: "Linda states the stakes", isBlue: true},
		"630" : {title: "Linda confesses about creamer"},
		"670" : {title: "Ted delivers the news to Phil", isBlue: true},
		"700" : {title: "Meet Rose - Ethical dilemma "},
		"735" : {title: "Mom backstory"},
		"760" : {title: "Phil wants to do it - Lem feels abandoned"},
		"810" : {title: "Freeze Phil - Ted reassures Linda about creamer", isGreen: true},
		"900" : {title: "Ted and Linda hold hands", isMagenta: true, isAct: true},
		"960" : {title: "Phil gets dropped/thawed", isBlue: true},
		"1005": {title: "Ted needs to fire Phil / Linda Elevator", isBlack: true},
		"1060": {title: "Ted used up his office affair on Veronica", isMagenta: true, isBlack: true},
		"1145": {title: "Ted tries to save Phil's job"},
		"1230": {title: "Ted refuses to fire Phil", isBlack: true},
		"1275": {title: "End Credits"},
		"runtime": 1310,
		"project": "Better Off Ted - Pilot",
		"author": "Victor Fresco"
	};
	
	totalTimeSeconds = eventDict["runtime"];
	setDegreesPerSecond();
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
	displayRuntime();
	//eventDict["runtime"] = totalTimeSeconds;
	draw();
}

function superstore()
{
	reset();
	eventDict = 
	{
		"0"   : {title: "VO About the Store", isRed:true},
		"27"  : {title: "Meet Amy / Engagement Ring"},
		"60"  : {title: "Meet Glenn"},
		"70"  : {title: "Dina / Jonah Interview - Setup Dina's crush on Jonah", isGreen: true},
		"120" : {title: "Jonah Insults Employees", isMagenta: true},
		"150" : {title: "Amy Works Here"},
		"190" : {title: "Opening Credits", isAct: true},
		"210" : {title: "Staff meeting"},
		"230" : {title: "Jonah Apologizes ", isMagenta: true},
		"270" : {title: "Meet Mateo - (Setup rivalry with Jonah)", isBlue: true},
		"285" : {title: "Glenn Likes the Bible"},
		"320" : {title: "\"Welcome to Cloud 9\""},
		"375" : {title: "Amy gives Jonah a task", isMagenta: true},
		"405" : {title: "Bo/Cheyenne Proposal #1", isRed:true},
		"480" : {title: "Jonah / Mateo Rivalry continues", isBlue: true},
		"500" : {title: "Looting begins"},
		"525" : {title: "Jonah messed up", isMagenta: true},
		"570" : {title: "Amy fights customer over TV"},
		"620" : {title: "Gunshot - Mistake is done", isAct: true},
		"660" : {title: "Jonah builds a can tower"},
		"690" : {title: "Jonah in trouble with Amy again", isMagenta: true},
		"750" : {title: "Dina puts on makeup for Jonah", isGreen: true},
		"780" : {title: "Mateo points out Jonah's flaws", isBlue: true},
		"810" : {title: "Cart Race"},
		"840" : {title: "Jonah is fun; Amy is not"},
		"870" : {title: "Amy confides in Jonah - feels stuck", isMagenta: true},
		"960" : {title: "Store Closes", isAct: true},
		"980" : {title: "Robbery"},
		"1005": {title: "Flashmob / Bo Proposal #2", isRed:true},
		"1095": {title: "Jonah surprises Amy with stars", isMagenta: true},
		"1130": {title: "Parking lot / Good night", isAct: true},
		"1215": {title: "Jonah wanted Amy's day to feel special"},
		"1245": {title: "Amy tells Jonah her name", isMagenta: true},
		"1265": {title: "Garrett invites Jonah to hang"},
		
		"runtime": 1290,		
		"project": "Superstore - Pilot", 
		"author": "Justin Spitzer"
	};
	totalTimeSeconds = 1330;
	setDegreesPerSecond();
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
	displayRuntime();
	eventDict["runtime"] = totalTimeSeconds;
	draw();
}

function elf()
	{
		reset();
		eventDict = {
		"0": {
			"title": "Opening Sequence"
		},
		"30": {
			"title": "You're probably here about the story"
		},
		"225": {
			"title": "Buddy as a baby, taken by Santa"
		},
		"536": {
			"title": "Buddy doesn't fit in an Elf's world"
		},
		"895": {
			"title": "Buddy leaves the North Pole"
		},
		"1316": {
			"title": "Buddy in Empire State Building/Finds Dad"
		},
		"1522": {
			"title": "Buddy arrives at Gimbal's"
		},
		"2058": {
			"title": "Buddy gives lingerie to dad"
		},
		"2297": {
			"title": "He's not Santa!"
		},
		"2568": {
			"title": "Walter brings Buddy home"
		},
		"3140": {
			"title": "Snowball Fight"
		},
		"3480": {
			"title": "Buddy goes to work"
		},
		"3919": {
			"title": "Buddy/Jovie Date"
		},
		"4045": {
			"title": "Miles Finch"
		},
		"4341": {
			"title": "Buddy Runs Away"
		},
		"4676": {
			"title": "Walter/Michael find the Sleigh/Engine"
		},
		"5131": {
			"title": "Jovie sings carols in the street"
		},
		"5465": {
			"title": "End Credits"
		},
		"runtime": 5820,
		"project": "Elf",
		"author": "David Berenbaum",
		"EndCredits": 5465
		}
		
		totalTimeSeconds = eventDict["runtime"];
		setDegreesPerSecond();
		document.getElementById("project").value = eventDict["project"];
		document.getElementById("author").value = eventDict["author"];
		displayRuntime();
		//eventDict["runtime"] = totalTimeSeconds;
		draw();
	}

function reset()
{
	if(fromQuery)
	{
		return;
	}
	rItems = [];
	gItems = [];
	bItems = [];
	cItems = [];
	mItems = [];
	yItems = [];
	kItems = [];
	linkDict = {};
	eventDict = {};
	totalTimeSeconds = 100;
	document.getElementById("runtime_mins").value = 1;
	document.getElementById("runtime_secs").value = 40;
	document.getElementById("inputfile").value = null;
	document.getElementById("project").value = "New Storyclock";
	document.getElementById("author").value = "Author";
	clockStarted = false;
	document.getElementById("start_clocking").innerHTML = "Start Clocking";
	updateRuntime();	
	draw();
}

function writeValuesToTable()
{	
	var div = document.getElementById("myDiv");
	div.innerHTML = "";	
	
	for (var key in eventDict)
	{
		if(isNaN(key))
			continue;		
		var eventObject =  eventDict[key];
		var eventText = eventObject.title;
		eventText = eventText.replace("\'", "&apos;");
		eventText = eventText.replace("\"", "&quot;");
		var divHTML = "";		
		divHTML += 
			"<div class='data_element'>"+
			"<input class='readonly' value='"+key+"' size='4' readonly>"+
			"<input class='input' id='eventInput"+key+"' value='"+eventText+"'>"+			
			checkBox("Red", key, eventObject.isRed)+			
			checkBox("Green", key, eventObject.isGreen)+			
			checkBox("Blue", key, eventObject.isBlue)+
			checkBox("Cyan", key, eventObject.isCyan)+
			checkBox("Magenta", key, eventObject.isMagenta)+
			checkBox("Yellow", key, eventObject.isYellow)+		
			checkBox("Black", key, eventObject.isAct)+"<br>"+
			"<input class='input' id='newKey"+key+"' value='"+key+"' size='4'>"+
			"<button class='button' onClick = 'updateValue("+key+");'>Update</button>"+
			"<button class='red_button' onClick = 'deleteValue("+key+");'>Delete</button>"+
			"</div>";
		
		if (sortAsc)
			div.innerHTML += divHTML;
		else
			div.innerHTML = divHTML + div.innerHTML;		
	}
	
	div.innerHTML = 
		"<H1>Check the colored boxes to link beats.</H1> " + div.innerHTML;
}

function checkBox(inColor, inKey, isChecked)
{
	switch(inColor)
	{
		case "Red":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Green":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Blue":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Cyan":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Magenta":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Yellow":
			isChecked = isChecked ? "checked" : "";
			break;
		case "Black":
			isChecked = isChecked ? "checked" : "";
			break;
	}
	var returnString = "";
	returnString +=	"<label class='container' style='background-color:"+inColor+";'>";
	returnString +=	"<input type='checkbox' id='"+inKey+"is"+inColor+"' onChange='add"+inColor+"Link("+inKey+"); draw();' "+isChecked+" >";
	returnString += "<div class='checkmark' style='background-color:"+inColor+"; border: solid white;'></div></label>"
	return returnString;
	
}

function updateValue(inKey)
{
	var newKey = parseInt(document.getElementById("newKey" + inKey).value);
	eventDict[inKey].title = document.getElementById("eventInput" + inKey).value;
	
	//if we're updating the key, copy to the new key and delete the old key
	if(parseInt(inKey) != newKey)
		{
			eventDict[newKey] = eventDict[inKey];
			delete eventDict[inKey];
		}
		
	writeValuesToTable();
	draw();
}

function deleteValue(inKey)
{
	delete eventDict[inKey];
	draw();
}

function updateRuntime() 
{	
		
	validateRuntime();
	
	var minsToSecs = parseInt(document.getElementById("runtime_mins").value) * 60;
	var newTotalTimeSeconds = parseInt(document.getElementById("runtime_secs").value) + minsToSecs;
	//check to see if there is a new runtime
	if (newTotalTimeSeconds != totalTimeSeconds)
		{
			if(confirm("You've changed the runtime.\n"+
					   "Would you like to redistribute your beats?"))
				{
					redistributeTimes(newTotalTimeSeconds);
				}else if(newTotalTimeSeconds < totalTimeSeconds)
					{
						alert("You've made your runtime shorter. This will mess everything up. I'm gonna redistribute anyway. It's for your own good.");
						redistributeTimes(newTotalTimeSeconds);
					}
		}
	totalTimeSeconds = newTotalTimeSeconds;
	degreesPerSecond = 360/totalTimeSeconds;
	eventDict["runtime"] = totalTimeSeconds;
	draw();
}

function saveToJSON() 
{
	var saveData = JSON.stringify(eventDict);
	var filename = eventDict["project"]+".storyclock";
	var file = new Blob([saveData], {type: "JSON"});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
   else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function setCloudData()
{
	var saveData = JSON.stringify(eventDict);
	document.getElementById("clockData").value = saveData;
}

var inputFile = document.getElementById('inputfile');


inputFile.addEventListener('change', function() 
{
	eventDict = {};
	//totalTimeSeconds = 0;
	document.getElementById("project").value = defaultTitle;
	var filetype = inputFile.files[0].name.split(".").pop().toLowerCase();
	var fr=new FileReader();	
	fr.onload=function(){
		if (filetype == "csv")
		{
			var keyValArray = fr.result.split("\n");
			
			for (var pair in keyValArray)
				{
				var currentPair = keyValArray[pair].split(",");
				if(!isNaN(parseInt(currentPair[1])))
				{
					if (currentPair[1].indexOf("%"))
					{	
						isPercentage = true;
						totalTimeSeconds = 10000;
					}
					var index = isPercentage ?  parseInt(parseInt(currentPair[1])*100) : parseInt(currentPair[1]);
					
					eventDict[index] = {title: currentPair[0]};
				}
				else {
					//console.log("'" + currentPair[1] + "' is not a valid number. Beat: '" + currentPair[0] + "' has been skipped.");
				}
			}
		}else if(filetype == "storyclock")
		{
			var legacyFile = false;
			var fileData = JSON.parse(fr.result);
			if(fileData['events'] != null)
			{
				//this is an old version
				alert("This is an old storyclock file.\nLink data may not convert correctly.\nIt is recommended that you resave after loading.");
				legacyFile = true;
				eventDict = fileData['events'];
				inkDict = (fileData['links'] != null) ? fileData['links'] : '{}';
				convertLegacyData();
			}else{
				eventDict = fileData;
			}
			if(isNaN(eventDict["runtime"]))
			{
				totalTimeSeconds=100;
				displayRuntime();
			}else{
				totalTimeSeconds = eventDict["runtime"];
				displayRuntime();
			}
			
			if(eventDict["project"] != null)
			{
				document.getElementById("project").value = eventDict["project"];
			}
			
			
			if(eventDict["author"] != null)
			{
				document.getElementById("author").value = eventDict["author"];
			}
			
			if(isNaN(eventDict["EndCredits"]))
			{
				for (var key in eventDict)
				{
					if(eventDict[key].title == "End Credits")
					{
						eventDict["EndCredits"] = key;
						break;
					}
				}
			}
			
			
		}
		else{
			alert("Invalid File Type.");
		}
		
		if (isNaN(totalTimeSeconds) || totalTimeSeconds == 0)
		{
			totalTimeSeconds = isPercentage ? 10000 : 100;
		}
		displayRuntime();
	}
	
		
	fr.readAsText(this.files[0]);
	document.getElementById("loadButton").style.visibility = "visible";
	
})

function convertLegacyData()
{	var titleVar;
	for (var key in eventDict)
	{
		if (!isNaN(key))
		{
			titleVar = eventDict[key];
			eventDict[key] = {title: titleVar};
		}
	}
}

function toggleCanvas()
{
	if (document.getElementById("canvas_div").style.visibility == "visible")
		{
			document.getElementById("canvas_div").style.visibility = "hidden";
			c.height = "0";
		}else{
			document.getElementById("canvas_div").style.visibility = "visible";
			c.height = defaultWidth["y"];
			draw();
		}
		document.getElementById("toggle_canvas").innerHTML = (document.getElementById("canvas_div").style.visibility == "visible") ? "Hide StoryClock" : "Show StoryClock";												  
}

function hideCanvas()
{
	document.getElementById("canvas_div").style.visibility = "hidden";
	c.height = "0";
	document.getElementById("toggle_canvas").innerHTML = "Show StoryClock";
}

function unhideCanvas()
{
	document.getElementById("canvas_div").style.visibility = "visible";
	c.height = defaultWidth["y"];
	document.getElementById("toggle_canvas").innerHTML = "Hide StoryClock";
}

function displayRuntime()
{
	var secsToMins = parseInt(totalTimeSeconds/60);
	var secsRemainder = parseInt(totalTimeSeconds % 60);
	document.getElementById("runtime_mins").value = secsToMins;
	document.getElementById("runtime_secs").value = secsRemainder;
}

function validateRuntime()
{
	var runtimeM = (isNaN(parseInt(document.getElementById("runtime_mins").value))) ? 0 : document.getElementById("runtime_mins").value;
	var runtimeS = (isNaN(parseInt(document.getElementById("runtime_secs").value))) ? 0 : document.getElementById("runtime_secs").value;
	
	document.getElementById("runtime_mins").value = runtimeM;
	document.getElementById("runtime_secs").value = runtimeS;
}

function validateEvent()
{
	var eventTimeM = (isNaN(parseInt(document.getElementById("event_min").value))) ? 0 : document.getElementById("event_min").value;
	var eventTimeS = (isNaN(parseInt(document.getElementById("event_sec").value))) ? 0 : document.getElementById("event_sec").value;
	
	document.getElementById("event_min").value = eventTimeM;
	document.getElementById("event_sec").value = eventTimeS;
}

function link(inParent)
{	var childDesc = "";
	//console.log("\n\n\nNew Link Added");
	//console.log("linkDict: "+JSON.stringify(linkDict));
	if(linkDict[inParent] == null)
		linkDict[inParent] = {};
	var newChild = document.getElementById(inParent+"linkTo").value.toUpperCase();
	if(newChild.toLowerCase() == "act")
	{
		childDesc = true;
	}else{
		childDesc = document.getElementById(inParent+"linkColor").value.toUpperCase();
	}
	linkDict[inParent][newChild] = childDesc;
	//console.log("new child added\nlinkDict: "+JSON.stringify(linkDict));
	draw();
}

function drawLinks(){
	var previous = null;	
	var currentItems;
	var color;	

	//red lines
	currentItems = rItems;
	color = "red";

	for (var key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		var linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		var beginCoords = getXY(previous, 0, false, -1, false);
		var endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//green lines
	currentItems = gItems;
	color = "green";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//blue lines
	currentItems = bItems;
	color = "blue";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//cyan lines
	currentItems = cItems;
	color = "cyan";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//magenta lines
	currentItems = mItems;
	color = "magenta";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//yellow lines
	currentItems = yItems;
	color = "yellow";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}

	//Black lines
	currentItems = kItems;
	color = "Black";
	previous = null;
	for (key in currentItems)
	{		
		if(previous == null)
		{
			previous = currentItems[key];
			continue;
		}
		ctx.setLineDash([5,5]);
		linkColor = darkMode ? "lightBlack" : color;
		ctx.strokeStyle = linkColor;
		ctx.lineWidth = 2;
		beginCoords = getXY(previous, 0, false, -1, false);
		endCoords = getXY(currentItems[key], 0, false, -1, false);
		ctx.beginPath();
		//move to the parent
		ctx.moveTo(beginCoords['x'], beginCoords['y']);
		//make the curve
		ctx.quadraticCurveTo(centerX, centerY, endCoords['x'], endCoords['y']);
		//draw it
		ctx.stroke();
		previous = currentItems[key];	

	}
}

function getXY(inSeconds, offsetAmount, useTaper, previousY, crossed180)
{
	var angle = inSeconds * degreesPerSecond;
	var xPos = 0;
	var yPos = 0;	

	var offsetRadius = radius + offsetAmount;
	if(useTaper)
		//adjust the word radius based on angle. Poles are farther than equator
		offsetRadius = offsetAmount + (Math.abs(Math.cos(angle/180 * Math.PI))) * taperMultiplier;
	
	//convert angle to radians
	var radians = (angle-90) * Math.PI / -180;

	//figure out the x,y based on angle and polar radius
	xPos = offsetRadius * Math.cos(radians) + centerX;
	yPos = -1 * offsetRadius * Math.sin(radians) + centerY;	

	//left or right justify based on hemisphere
	if (angle <180){
		if(previousY != -1){
			if (yPos - previousY < textHeight)
			{
				yPos = previousY + textHeight;
			}
		}
		ctx.textAlign = "left"
	}else{
		ctx.textAlign = "right"
		if (!crossed180)
		//if this is our first time on the left side, we want to reset the offest indicator
		{
			previousY = -1;
		}
			
		
		if(previousY != -1){
			if (previousY - yPos < textHeight)
			{
				yPos = previousY - textHeight;
			}
		}	
		if(angle == 180)
			ctx.textAlign = "center";
	}	
	
	previousY = yPos;
	return {
		'x': xPos,
		'y': yPos
	};
}

function removeLink(inParent, inChild)
{
	delete linkDict[inParent][inChild];
	draw();
}

function saveHeader()
{
	eventDict["project"] = document.getElementById("project").value;
	eventDict["author"] = document.getElementById("author").value;		
}

function updateHeader(){
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
}

function updateHeaderFromParams(inParams){
	eventDict["project"] = inParams.get('project');
	eventDict["author"] = inParams.get('author');
	document.getElementById("project").value = eventDict["project"];
	document.getElementById("author").value = eventDict["author"];
}

function loadFromQuery(inParams){
	fromQuery = true;
	var keys = inParams.keys();
	var unescapedString = "";
	linkDict = {};
	for(var key of keys)
	{
		unescapedString = decodeURI(inParams.get(key));
		eventDict[key] = JSON.parse(unescapedString);			
	}
	totalTimeSeconds = eventDict['runtime'];
	degreesPerSecond = totalTimeSeconds/360;
	displayRuntime();
	updateRuntime();
	updateHeaderFromParams(inParams);
	draw();
}

function generateURL(){
	var shareURL = "https://storyclock.nicksalve.com?";
	var shareParams = new URLSearchParams("");
	var appendString = "";
	shareParams.append('fromQuery', true);
	for(var key in eventDict)
	{
		appendString = JSON.stringify(eventDict[key]);
		shareParams.append(key, appendString);
	}
	
	shareURL += shareParams.toString();
	var urlText = document.createElement("textarea");
	document.body.appendChild(urlText);
	urlText.value = shareURL;
	urlText.select();
	document.execCommand("copy");
	document.body.removeChild(urlText);
	alert("URL has been copied to clipboard.");
}

function addRedLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isRed");
	if(checkbox.checked == true)
		eventDict[inKey].isRed = true;
	else
		eventDict[inKey].isRed = false;
}
function addGreenLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isGreen");
	if(checkbox.checked == true)
		eventDict[inKey].isGreen = true;
	else
		eventDict[inKey].isGreen = false;
}
function addBlueLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isBlue");
	if(checkbox.checked == true)
		eventDict[inKey].isBlue = true;
	else
		eventDict[inKey].isBlue = false;
}
function addCyanLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isCyan");
	if(checkbox.checked == true)
		eventDict[inKey].isCyan = true;
	else
		eventDict[inKey].isCyan = false;
}
function addMagentaLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isMagenta");
	if(checkbox.checked == true)
		eventDict[inKey].isMagenta = true;
	else
		eventDict[inKey].isMagenta = false;
}
function addYellowLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isYellow");
	if(checkbox.checked == true)
		eventDict[inKey].isYellow = true;
	else
		eventDict[inKey].isYellow = false;
}
function addBlackLink(inKey)
{
	var checkbox = document.getElementById(inKey+"isBlack");
	if(checkbox.checked == true)
		eventDict[inKey].isAct = true;
	else
		eventDict[inKey].isAct = false;
}

function redistributeTimes(inNewTime)
{
	var redistributedEventDict = {};
	for(var key in eventDict)
		{
			if(parseInt(key) == NaN)
			{
				redistributedEventDict[key] = eventDict[key];
			}
			var relativePosition = parseInt(key) / totalTimeSeconds;
			var updatedPosition = parseInt(relativePosition * inNewTime);
			redistributedEventDict[updatedPosition] = eventDict[key];
		}
	eventDict = redistributedEventDict;
}

function copyToClipboard()
{
	let beatText = stringifyBeats();
	navigator.clipboard.writeText(beatText);
	alert("Beats copied to clipboard. \n" + beatText);
}

function stringifyBeats()
{
	var eventString = "";
	for (var key in eventDict)
		{
			if(eventDict[key].title != null)
			{
				eventString += eventDict[key].title + "\n";
			}
		}
	return eventString;
}
