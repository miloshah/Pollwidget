/**
 * @class
 * @classdesc Represents a PollWidget.
 */
class PollWidget {
    /**
     * @constructor
     * @param {string} containerSelector - The selector for the poll container.
     * @param {Array} questions - The questions for the poll.
     */
    constructor(containerSelector, questions) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`No element matches the selector: ${containerSelector}`);
        }

        this.containerId = this.container.id;
        this.questions = questions;
        this.sessionResponses = this.getSessionResponses();
        this.totalResponses = this.getTotalResponses();
        this.renderedQuestions = new Set();

        // Add this widget to the allWidgets array
        PollWidget.allWidgets.push(this);

        // Clear sessionStorage for all widgets when the page is refreshed
        window.addEventListener('beforeunload', this.clearSessionStorage);
    }

    /**
     * @method
     * @description Clears the session storage.
     */
    clearSessionStorage() {
        PollWidget.allWidgets.forEach(widget => {
            sessionStorage.removeItem('poll_responses_' + widget.containerId);
        });
    }

    /**
     * @method
     * @description Gets the session responses.
     * @returns {Array} The session responses.
     */
    getSessionResponses() {
        return JSON.parse(sessionStorage.getItem('poll_responses_' + this.containerId)) || [];
    }

    /**
     * @method
     * @description Gets the total responses.
     * @returns {Array} The total responses.
     */
    getTotalResponses() {
        return JSON.parse(localStorage.getItem('total_poll_responses_' + this.containerId)) || [];
    }

    /**
     * @method
     * @description Renders the poll.
     */
    render() {
        if (this.questions.length === 0) {
            console.log("No questions to render.");
            return;
        }

        const sortedQuestions = [...this.questions].sort((a, b) => a.question.localeCompare(b.question));

        // Check if the poll has already been rendered
        const questionsKey = this.container.id + JSON.stringify(sortedQuestions);

        if (PollWidget.renderedPolls.has(questionsKey)) {
            console.log("This poll has already been rendered!");
            return;
        }

        this.questions.forEach((question, index) => {
            const pollElement = this.createPollElement(question, index);
            this.container.appendChild(pollElement);
            this.renderedQuestions.add(question.question);
        });

        // Add the poll to the renderedPolls map
        PollWidget.renderedPolls.set(questionsKey, this.container.id);
    }

    /**
     * @method
     * @description Creates a poll element.
     * @param {Object} question - The question object.
     * @param {number} index - The index of the question.
     * @returns {HTMLElement} The poll element.
     */
    createPollElement(question, index) {
        const pollElement = document.createElement('div');
        pollElement.classList.add('poll');

        const questionElement = document.createElement('p');
        questionElement.textContent = question.question;
        pollElement.appendChild(questionElement);

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');
        question.options.forEach((option, optionIndex) => {
            const optionElement = document.createElement('div');
            optionElement.classList.add('option');
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => this.vote(index, optionIndex));
            optionsContainer.appendChild(optionElement);
            // Add tabindex to make the option focusable
            optionElement.setAttribute('tabindex', '0');

            // Add role and aria-label for screen readers
            optionElement.setAttribute('role', 'button');
            optionElement.setAttribute('aria-label', `Option ${optionIndex + 1}: ${option}`);
        });
        pollElement.appendChild(optionsContainer);

        const resultElement = document.createElement('div');
        resultElement.classList.add('result');
        resultElement.setAttribute('data-question-index', index);
        resultElement.textContent = `Votes: ${this.getVotes(index)}`;
        pollElement.appendChild(resultElement);

        return pollElement;
    }

    /**
     * @method
     * @description Handles a vote.
     * @param {number} questionIndex - The index of the question.
     * @param {number} optionIndex - The index of the option.
     */
    vote(questionIndex, optionIndex) {
        const hasVotedInSession = this.sessionResponses.some(response =>
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );

        if (!hasVotedInSession) {
            this.sessionResponses.push({ questionIndex, optionIndex, containerId: this.containerId });
            sessionStorage.setItem('poll_responses_' + this.containerId, JSON.stringify(this.sessionResponses));

            this.totalResponses.push({ questionIndex, optionIndex, containerId: this.containerId });
            localStorage.setItem('total_poll_responses_' + this.containerId, JSON.stringify(this.totalResponses));

            this.updateResults(questionIndex);
        } else {
            console.log("You've already voted for this question in this session!");
        }
    }

    /**
     * @method
     * @description Updates the results.
     */
    updateResults(questionIndex) {
        const resultElement = this.container.querySelector(`.result[data-question-index="${questionIndex}"]`);
        if (resultElement) {
            resultElement.textContent = `Votes: ${this.getVotes(questionIndex)}`;
        }
    }

    /**
     * @method
     * @description Gets the votes for a question.
     * @param {number} questionIndex - The index of the question.
     * @returns {number} The number of votes.
     */
    getVotes(questionIndex) {
        const questionResponses = this.totalResponses.filter(response => 
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );
        return questionResponses.length;
    }
}

// Initialize static properties
PollWidget.renderedPolls = new Map();
// static property to hold all widgets
PollWidget.allWidgets = [];