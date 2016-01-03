class Conjugate {
    static generateRandomConjugationTest() {
        var keys = Object.keys(__WORDS__);
        var verb = keys[Math.floor(Math.random() * keys.length)];
        var verbArray = __WORDS__[verb];
        var moodAndTenseIndex = Math.floor(Math.random() * Conjugate.moodsAndTenses.length);
        var personAndNumberIndex = Math.floor(Math.random() * Conjugate.personAndNumber.length);

        return {
            verb: verb,
            definition: verbArray[0],
            conjugatedVerb: verbArray[1 + (Conjugate.moodsAndTenses[moodAndTenseIndex][0] * 6) +
                                          Conjugate.personAndNumber[personAndNumberIndex][0]],
            tense: Conjugate.moodsAndTenses[moodAndTenseIndex][1],
            mood: Conjugate.moodsAndTenses[moodAndTenseIndex][2],
            personAndNumberText: Conjugate.personAndNumber[personAndNumberIndex][1],
        }
    }

    static startTesting() {
        if (Conjugate.animationFrame !== null)
            cancelAnimationFrame(Conjugate.animationFrame);

        var animationFrameFunction = function(timestamp) {
            if (Conjugate.animationStart == null) {
                Conjugate.animationStart = timestamp;
            }

            var percentDone =
                Math.min(((timestamp - Conjugate.animationStart) / Conjugate.timeout) * 100, 100);
            document.getElementById('timerguts').style.width = (100 - percentDone) + "%";

            if (percentDone == 100) {
                Conjugate.checkConjugation();
                return;
            }

            Conjugate.animationFrame = requestAnimationFrame(animationFrameFunction);

        };

        Conjugate.animationStart = null;
        Conjugate.animationFrame = requestAnimationFrame(animationFrameFunction);
        Conjugate.inTestingMode = true;
    }

    static stopTesting() {
        if (Conjugate.animationFrame !== null)
            cancelAnimationFrame(Conjugate.animationFrame);
        Conjugate.inTestingMode = false;
    }

    static chooseNewConjugation() {
        var conjugationTest = Conjugate.generateRandomConjugationTest();
        while (conjugationTest.conjugatedVerb == '') {
            conjugationTest = Conjugate.generateRandomConjugationTest();
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

        Conjugate.startTesting();
    }

    static checkConjugation() {
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

        Conjugate.stopTesting();
    }

    static getEvent(event) {
        if (!event)
            return window.event;
        return event;
    }

    static keyPress(event) {
        var event = Conjugate.getEvent(event);
        if (event.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();

            if (Conjugate.inTestingMode) {
                Conjugate.checkConjugation();
            } else {
                Conjugate.chooseNewConjugation();
            }
        }

        return false;
    }

    static start() {
        var inputBox = document.getElementById('inputbox');
        inputBox.addEventListener("keypress", Conjugate.keyPress, false);
        document.body.addEventListener("keypress", Conjugate.keyPress, false);
        Conjugate.chooseNewConjugation();
    }
}

Conjugate.inTestingMode = false;
Conjugate.animationFrame = null;
Conjugate.animationStart = null;
Conjugate.timeout = 5 * 1000; // 5 seconds

Conjugate.moodsAndTenses = [
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

Conjugate.personAndNumber = [
    [0, "yo"],
    [1, "tú"],
    [2, "él/ella/usted"],
    [3, "nosotros"],
    [4, "vosotros"],
    [5, "ellos/ellas/ustedes" ],
];
