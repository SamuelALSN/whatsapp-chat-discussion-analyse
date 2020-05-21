let uploaded_file = document.getElementById("file_input")
let inputElement = document.getElementById("file_input")

inputElement.addEventListener("change", () => {
    let file = uploaded_file.files[0]
    let reader = new FileReader()
    reader.onload = (e) => {
        const file = e.target.result;
       // removeLineBreak(file)
        displayanalyseToUserInterface(file)
    }

    reader.readAsText(file)

    function removeLineBreak(file) {
        /**
         * Fixes newline in a specific message .
         * Returns array of lines.
         *
         * exemple:
         * fix
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
        //console.log(users_and_messages)
        return [users_and_messages, dates]
    }

    function getallUsers(file) {

        /**
         * Get all users in the discussions returned into an array
         *
         */

        let usersCleanedDiscussions = formatFile(file)[0]
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
        /**
         * Group for each user their messages into an object
         * exemple:
         *  user_with_messages = {
         *      user_1 : ["message_1",......."message_N"]
         *      .....                               ....
         *      .....                                ....
         *      user_N : ["message_1",......"message_N"]
         *  }
         *
         */
        let users = getallUsers(file)
        let discussions = formatFile(file)[0]
        let messageByUsers = {}

        for (let i = 0; i < users.length; i++) {
            let userRegex = new RegExp("^" + users[i])
            for (let j = 0; j < discussions.length; j++) {
                if (userRegex.test(discussions[j])) {
                    // console.log(users[i], discussions[j].split(": ")[1])
                    if (!messageByUsers[users[i]]) {
                        messageByUsers[users[i]] = [discussions[j].split(": ")[1]]
                    } else {
                        messageByUsers[users[i]].push(discussions[j].split(": ")[1])
                    }
                }
            }
        }

        // console.log(messageByUsers)
        return messageByUsers
    }

    function analyseDiscussions(file) {
        let user_with_messages = getUserMessages(file)

        const wordsToLookFor = [
            "lol", "lmao", "fuck", "merde", "putain", "ass",
            "amen", "akpe", "merci", "nagode", "imela",
            "thanks", "thank you", "alhamdulillah", "shukran"
        ]

        let allEmojiCheckingRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
        let angryFaceEmojiRegex = /\uD83D\uDE21/g
        let keyWordsPerUser = {}

        for (let i = 0; i < wordsToLookFor.length; i++) {
            let wordsToLookForRegex = new RegExp(wordsToLookFor[i], "gi")
            // let wordsToLookForRegex = new RegExp("^"+wordsToLookFor[i]+"$", "gi")

            for (let key in user_with_messages) {
                let occurences = 0, totalEmojiPerUser = 0, totalAngryFaceEmojiPerUser = 0

                for (let j = 0; j < user_with_messages[key].length; j++) {
                    if (wordsToLookForRegex.test(user_with_messages[key][j])) {
                        occurences += user_with_messages[key][j].match(wordsToLookForRegex).length
                    }
                    if (allEmojiCheckingRegex.test(user_with_messages[key][j])) {
                        //console.log(user_with_messages[key][j].match(allEmojiCheckingRegex))
                        totalEmojiPerUser += user_with_messages[key][j].match(allEmojiCheckingRegex).length
                    }

                    if (angryFaceEmojiRegex.test(user_with_messages[key][j])) {
                       // console.log(user_with_messages[key][j].match(angryFaceEmojiRegex))
                        totalAngryFaceEmojiPerUser += user_with_messages[key][j].match(angryFaceEmojiRegex).length
                    }

                }
                if (!keyWordsPerUser[key]) {
                    keyWordsPerUser[key] = {
                        [wordsToLookFor[i]]: occurences
                    }

                } else {
                    keyWordsPerUser[key][wordsToLookFor[i]] = occurences

                }
                keyWordsPerUser[key]["totalEmoji"] = totalEmojiPerUser
                keyWordsPerUser[key]["angryFaceEmoji"] = totalAngryFaceEmojiPerUser
            }
        }
       // console.log(keyWordsPerUser)

        return keyWordsPerUser
    }

    function displayanalyseToUserInterface(file) {
     let analyseResult = analyseDiscussions(file)
        console.log(analyseResult)
    }
})