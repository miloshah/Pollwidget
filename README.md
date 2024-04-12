# Poll Widget

This is a simple embed poll widget without using iframe. It allows displaying configurable questions with options and collects user votes.

### Usage
1. Include the `poll-widget.js` file in your HTML page.
2. Create an instance of `PollWidget` with the container selector and questions array.
3. Call the `render()` method to display the poll.

Example:
```html
<div id="poll-container"></div>
<script src="poll-widget.js"></script>
<script>
    const questions = [
        {
            question: "How you feel today:",
            options: ["Brilliant! I have so much energy", "Always can be worse.", "Please, end my misery."]
        }
    ];
    const pollWidget = new PollWidget("#poll-container", questions);
    pollWidget.render();
</script>



### Summary of Technical Choices:
- Used vanilla JavaScript for simplicity and reduced dependencies.
- Utilized local storage for storing user responses to avoid server-side setup.
- Separated concerns by creating a `PollWidget` class responsible for rendering polls and managing votes.
- Encapsulated widget initialization and rendering to ensure modularity and reusability.
- Provided documentation for usage and configuration in the README file.
- Ensured responsiveness and styling to improve user experience.

This implementation meets the requirements specified and provides a foundation for further enhancements and customizations.


###Improvements:
-  Persistence of votes across sessions: The current implementation uses localStorage to store the responses. This means that the votes are only saved locally on the user’s machine. If the user clears their browser data or switches devices, the votes will be lost. A more robust solution would be to store the votes on a server.
- Internationalization of the text of the polls