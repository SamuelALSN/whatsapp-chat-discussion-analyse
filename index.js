let uploaded_file = document.getElementById("file_input")
let inputElement = document.getElementById("file_input")

inputElement.addEventListener("change", () => {
    let file = uploaded_file.files[0]
    let reader = new FileReader()
    reader.onload = (e) => {
        const file = e.target.result;
        removeLineBreak(file)
        getUserMessages(file)
    }

    reader.readAsText(file)

    function removeLineBreak(file) {
        /**
         * Fixes newline in a specific message .
         * Returns array of lines.
         *
         * exemple:
         *  turn
         * 04/08/2019 à 14:07 - Brook: Y a pas encore
         * Bcp de personnes
         * mais viens vite
         *
         * to : 04/08/2019 à 14:07 - Brook: Y a pas encore Bcp de personnes mais viens vite
         */
        let lines = file.split('\n');
        let check = 0;
        while (true) {
            for (let i = 1; i < lines.length - 2; i++) {
                if (lines[i] === '') {
                    lines[i - 1] += " " + lines[i + 1];
                    lines = lines.slice(0, i).concat(lines.slice(i + 2));
                    check = 0;
                    break;
                } else if (isNaN(lines[i].charAt(0)) && (!(lines[i].charAt(1) === '/'))) {
                    lines[i - 1] += lines[i];
                    lines = lines.slice(0, i).concat(lines.slice(i + 1));
                    check = 0;
                    break;
                }
                check = 1;
            }

            if (check === 1) {
                break;
            }
        }
        //console.log(lines)
        return lines;
    }

    function formatFile(file) {
        /**
         *  this function is aim to format file in the format below
         *  Username: Messages  in an array
         * and get dates in other array
         **/
        const lines = removeLineBreak(file)
        let users_and_messages = [], dates = []
        for (let i = 0; i < lines.length; i++) {
            try {
                const lineMessages = lines[i].split(" - ")
                const nonDatePart = lineMessages.slice(1)
                const datePart = lineMessages.slice(0, 1)
                dates.push(datePart)
                users_and_messages.push(nonDatePart.join(" - "))
            } catch (e) {
                console.log(e.message)

            }
        }
        // console.log(users_and_messages)
        return [users_and_messages, dates]
    }

    function getallUsers(file) {
        /**
         * Get all users in the discussions returned into an array
         *
         */

        let usersCleanedDiscussions = formatFile(file)[0]
        //console.log(usersCleanedDiscussions)
        let userNames = []
        let tempUser
        for (let i = 0; i < usersCleanedDiscussions.length; i++) {
            if (usersCleanedDiscussions[i].includes(':')) {
                tempUser = usersCleanedDiscussions[i].split(':')[0]
                if (!userNames.includes(tempUser)) {
                    userNames.push(tempUser)
                }

            }
        }
        // console.log(userNames)
        return userNames
    }

    function getUserMessages(file) {
        let users = getallUsers(file)
        let discussions = formatFile(file)[0]
        console.log(users)
        for (let i = 0; i < users.length; i++) {
             let userRegex = new RegExp("^"+users[i])
            for (let j = 0; j < discussions.length; j++) {
                if(userRegex.test(discussions[j])){
                    console.log(users[i],discussions[j].split(": ")[1])
                }
            }
        }

    }
})