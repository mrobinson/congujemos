var __TIMEOUT__ = 5 * 1000; // 5 seconds
var __ANIMATION_FRAME__ = null;
var __ANIMATION_START__ = null;

var __MOODS_AND_TENSES__ = [
    [0, "Present", "Indicative"],
    [1, "Future", "Indicative"],
    [2, "Imperfect", "Indicative"],
    [3, "Preterite", "Indicative"],
    [4, "Conditional", "Indicative"],
    [5, "Present Perfect", "Indicative"],
    [6, "Future Perfect", "Indicative"],
    [7, "Past Perfect", "Indicative"],
    // [8, "Preterite (Archaic)", "Indicative"],
    [9, "Conditional Perfect", "Indicative"],
    [10, "Present", "Subjunctive"],
    [11, "Imperfect", "Subjunctive"],
    [12, "Future", "Subjunctive"],
    [13, "Present Perfect", "Subjunctive"],
    [14, "Future Perfect", "Subjunctive"],
    [15, "Past Perfect", "Subjuntive"],
    [16, "Affirmative", "Imperative"],
    [17, "Negative", "Imperative"],
];

var __PERSON_AND_NUMBER__ = [
    [0, "yo"],
    [1, "tú"],
    [2, "él/ella/usted"],
    [3, "nosotros"],
    [4, "vosotros"],
    [5, "ellos/ellas/ustedes" ],
];

function generateRandomConjugationTest() {
    var keys = Object.keys(__WORDS__);
    var verb = keys[Math.floor(Math.random() * keys.length)];
    var verbArray = __WORDS__[verb];
    var moodAndTenseIndex = Math.floor(Math.random() * __MOODS_AND_TENSES__.length);
    var personAndNumberIndex = Math.floor(Math.random() * __PERSON_AND_NUMBER__.length);

    return {
        verb: verb,
        definition: verbArray[0],
        conjugatedVerb: verbArray[1 + (__MOODS_AND_TENSES__[moodAndTenseIndex][0] * 6) +
                                      __PERSON_AND_NUMBER__[personAndNumberIndex][0]],
        tense: __MOODS_AND_TENSES__[moodAndTenseIndex][1],
        mood: __MOODS_AND_TENSES__[moodAndTenseIndex][2],
        personAndNumberText: __PERSON_AND_NUMBER__[personAndNumberIndex][1],
    }
}

function startTesting() {
    if (__ANIMATION_FRAME__ !== null)
        cancelAnimationFrame(__ANIMATION_FRAME__);

    var animationFrameFunction = function(timestamp) {
        if (__ANIMATION_START__ == null) {
            __ANIMATION_START__ = timestamp;
        }

        var percentDone =
            Math.min(((timestamp - __ANIMATION_START__) / __TIMEOUT__) * 100, 100);
        document.getElementById('timerguts').style.width = (100 - percentDone) + "%";

        if (percentDone == 100) {
            checkConjugation();
            return;
        }

        __ANIMATION_FRAME__ = requestAnimationFrame(animationFrameFunction);

    };

    __ANIMATION_START__ = null;
    __ANIMATION_FRAME__ = requestAnimationFrame(animationFrameFunction);
    inTestingMode = true;
}

function stopTesting() {
    if (__ANIMATION_FRAME__ !== null)
        cancelAnimationFrame(__ANIMATION_FRAME__);
    inTestingMode = false;
}

function chooseNewConjugation() {
    var conjugationTest = generateRandomConjugationTest();
    while (conjugationTest.conjugatedVerb == '') {
        conjugationTest = generateRandomConjugationTest();
    }

    document.getElementById('word').innerText = conjugationTest.verb;
    document.getElementById('definition').innerText = "(" + conjugationTest.definition + ")";
    document.getElementById('conjugation').innerHTML =
        conjugationTest.tense +
        "<br/>" + conjugationTest.mood +
        "<br/>in the " + conjugationTest.personAndNumberText + " form";
    window.__ANSWER__ = conjugationTest.conjugatedVerb;
    console.log(conjugationTest.conjugatedVerb);

    var inputBox = document.getElementById('inputbox');
    inputBox.innerText = "";
    inputBox.style.display = "";
    inputBox.className = "wordbox noanswer";
    inputBox.setAttribute('contenteditable', 'true');
    inputBox.focus();

    var answerBox = document.getElementById('answerbox');
    answerBox.innerText = "blank";
    answerBox.style.visibility = "hidden";

    startTesting();
}

function checkConjugation() {
    var inputBox = document.getElementById('inputbox');
    var answerBox = document.getElementById('answerbox');

    if (inputBox.innerText == __ANSWER__)
        inputBox.className = "wordbox correct phaseout";
    else {
        inputBox.className = "wordbox incorrect phaseout";
        answerBox.innerText = __ANSWER__;
        answerBox.style.visibility = "";
    }
    inputBox.removeAttribute('contenteditable');

    stopTesting();
}

function getEvent(event) {
    if (!event)
        return window.event;
    return event;
}

function getEventTarget(event) {
    var event = getEvent(event);
    if (event.target)
        return event.target;
    else if (event.srcElement)
        return event.srcElement;
    return null;
}

function keyPress(event) {
    var event = getEvent(event);
    if (event.keyCode == 13) {
        event.preventDefault();
        event.stopPropagation();

        if (inTestingMode) {
            checkConjugation();
        } else {
            chooseNewConjugation();
        }
    }

    return false;
}

function start() {
    var inputBox = document.getElementById('inputbox');
    inputBox.addEventListener("keypress", keyPress, false);
    document.body.addEventListener("keypress", keyPress, false);
    chooseNewConjugation();
}

