class PollWidget {
    static renderedPolls = new Map();
    static allWidgets = []; // New static property to hold all widgets

    constructor(containerSelector, questions) {
        this.container = document.querySelector(containerSelector);
        if (!this.container) {
            throw new Error(`No element matches the selector: ${containerSelector}`);
        }

        this.containerId = this.container.id;
        this.questions = questions;
        this.sessionResponses = JSON.parse(sessionStorage.getItem('poll_responses_' + this.containerId)) || [];
        this.totalResponses = JSON.parse(localStorage.getItem('total_poll_responses_' + this.containerId)) || [];
        this.renderedQuestions = new Set();

        PollWidget.allWidgets.push(this); // Add this widget to the allWidgets array

        // Clear sessionStorage for all widgets when the page is refreshed
        window.onbeforeunload = function() {
            PollWidget.allWidgets.forEach(widget => {
                console.log(widget.containerId);
                sessionStorage.removeItem('poll_responses_' + widget.containerId);
            });
        };
    }

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
        });
        pollElement.appendChild(optionsContainer);

        const resultElement = document.createElement('div');
        resultElement.classList.add('result');
        resultElement.textContent = `Votes: ${this.getVotes(index)}`;
        pollElement.appendChild(resultElement);

        return pollElement;
    }

    vote(questionIndex, optionIndex) {
        const hasVotedInSession = this.sessionResponses.some(response =>
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );

        if (!hasVotedInSession) {
            this.sessionResponses.push({ questionIndex, optionIndex, containerId: this.containerId });
            sessionStorage.setItem('poll_responses_' + this.containerId, JSON.stringify(this.sessionResponses));

            this.totalResponses.push({ questionIndex, optionIndex, containerId: this.containerId });
            localStorage.setItem('total_poll_responses_' + this.containerId, JSON.stringify(this.totalResponses));

            this.updateResults();
        } else {
            console.log("You've already voted for this question in this session!");
        }
    }

    updateResults() {
        const resultElements = this.container.querySelectorAll('.result');
        resultElements.forEach((resultElement, index) => {
            resultElement.textContent = `Votes: ${this.getVotes(index)}`;
        });
    }

    getVotes(questionIndex) {
        const questionResponses = this.totalResponses.filter(response => 
            response.questionIndex === questionIndex && response.containerId === this.containerId
        );
        return questionResponses.length;
    }
}