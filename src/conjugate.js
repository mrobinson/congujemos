class Conjugate {
    constructor(inputBoxElement,
                correctAnswerBoxElement,
                wordElement,
                definitionElement,
                conjugationTextElement,
                timerFillElement) {

        this.inputBoxElement = inputBoxElement;
        this.correctAnswerBoxElement = correctAnswerBoxElement;
        this.wordElement = wordElement;
        this.definitionElement = definitionElement;
        this.conjugationTextElement = conjugationTextElement;
        this.timerFillElement = timerFillElement

        this.inTestingMode = false;
        this.animationFrame = null;
        this.animationStart = null;

        var keyHandler = this.keyPress.bind(this);
        this.inputBoxElement.addEventListener("keypress", keyHandler, false);
        document.body.addEventListener("keypress", keyHandler, false);
    }

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

    startTesting() {
        if (this.animationFrame !== null)
            cancelAnimationFrame(this.animationFrame);

        this.animationHandler = function(timestamp) {
            if (this.animationStart == null) {
                this.animationStart = timestamp;
            }

            var percentDone =
                Math.min(((timestamp - this.animationStart) / Conjugate.timeout) * 100, 100);
            this.timerFillElement.style.width = (100 - percentDone) + "%";

            if (percentDone == 100) {
                this.checkConjugation();
                return;
            }

            this.animationFrame = requestAnimationFrame(this.animationHandler);
        }.bind(this);

        this.animationStart = null;
        this.animationFrame = requestAnimationFrame(this.animationHandler);
        this.inTestingMode = true;
    }

    animationTick() {

    }

    stopTesting() {
        if (this.animationFrame !== null)
            cancelAnimationFrame(this.animationFrame);
        this.inTestingMode = false;
    }

    chooseNewConjugation() {
        var conjugationTest = Conjugate.generateRandomConjugationTest();
        while (conjugationTest.conjugatedVerb == '') {
            conjugationTest = Conjugate.generateRandomConjugationTest();
        }

        this.wordElement.innerText = conjugationTest.verb;
        this.definitionElement.innerText = "(" + conjugationTest.definition + ")";
        this.conjugationTextElement.innerHTML =
            conjugationTest.tense +
            "<br/>" + conjugationTest.mood +
            "<br/>in the " + conjugationTest.personAndNumberText + " form";
        window.__ANSWER__ = conjugationTest.conjugatedVerb;
        console.log(conjugationTest.conjugatedVerb);

        this.inputBoxElement.innerText = "";
        this.inputBoxElement.className = "wordbox noanswer";
        this.inputBoxElement.setAttribute('contenteditable', 'true');
        this.inputBoxElement.focus();

        this.correctAnswerBoxElement.innerText = "blank";
        this.correctAnswerBoxElement.style.visibility = "hidden";

        this.startTesting();
    }

    checkConjugation() {
        if (this.inputBoxElement.innerText == __ANSWER__)
            this.inputBoxElement.className = "wordbox correct phaseout";
        else {
            this.inputBoxElement.className = "wordbox incorrect phaseout";
            this.correctAnswerBoxElement.innerText = __ANSWER__;
            this.correctAnswerBoxElement.style.visibility = "";
        }
        this.inputBoxElement.removeAttribute('contenteditable');

        this.stopTesting();
    }

    static getEvent(event) {
        if (!event)
            return window.event;
        return event;
    }

    keyPress(event) {
        var event = Conjugate.getEvent(event);
        if (event.keyCode == 13) {
            event.preventDefault();
            event.stopPropagation();

            if (this.inTestingMode) {
                this.checkConjugation();
            } else {
                this.chooseNewConjugation();
            }
        }

        return false;
    }

    static start() {
        var conjugation = new Conjugate(
            document.getElementById('inputbox'),
            document.getElementById('answerbox'),
            document.getElementById('word'),
            document.getElementById('definition'),
            document.getElementById('conjugation'),
            document.getElementById('timerguts'));
        conjugation.chooseNewConjugation();
    }
}

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
