import { parse } from "path";
import { Packet } from "./packet.entity";
import { Question } from "./question.entity";
import { Theme } from "./theme.entity";

export class Parser {

    private static rmNewlines(text: string, removeSlashN: boolean = false) {
        text = text.replaceAll('\r', '');
        if (removeSlashN) {
            text = text.replaceAll('\n', '');
        }
        return text;
    }

    static textToPacket(text: string, questionRegexStr: string, themeRegexStr: string): Packet {
        /// text preprocessing (remove \r for example)
        /// regex preprocessing (replacing one slash with two could be happening on client-side)

        /* Parameter elaboration:
            - flag 'g' means 'global', it's for using lastIndex information;
            - flag 's' enables dotAll feature, it's for processing multiline strings;
            - flag 'i' means 'indices', it enables saving indices of capturing groups
        */
        const packet: Packet = new Packet();
        const questionRegex = new RegExp(questionRegexStr, "gsi");
        const themeRegex = new RegExp(themeRegexStr, "gsi");

        let lastIndex = 0;
        while (lastIndex < text.length) {
            const questionIndex = text.slice(lastIndex).search(questionRegex);
            const themeIndex = text.slice(lastIndex).search(themeRegex);

            if (questionIndex === -1 && themeIndex === -1) {
                break;
            }

            /// processing question
            if (themeIndex === -1 || (questionIndex !== -1 && questionIndex < themeIndex)) {
                const result = questionRegex.exec(text)!;

                const question = new Question();

                const fullQuestion = result[0];

                const parsedPrice = result?.groups?.price;
                if (parsedPrice === undefined) {
                    throw new Error("error: parsing question price failed. question text: " + fullQuestion);
                }
                question.price = +Parser.rmNewlines(parsedPrice);

                const parsedProblem = result?.groups?.problem;
                if (parsedProblem === undefined) {
                    throw new Error("error: parsing question failed. question text: " + fullQuestion);
                }
                question.problem = Parser.rmNewlines(parsedProblem);

                const parsedAnswer = result?.groups?.answer;
                if (parsedAnswer === undefined) {
                    throw new Error("error: parsing answer failed. question text: " + fullQuestion);
                }
                question.answer.push(Parser.rmNewlines(parsedAnswer));

                const parsedAccept = result?.groups?.accept;
                if (parsedAccept) {
                    question.answer.push(Parser.rmNewlines(parsedAccept));
                }

                const parsedComment = result?.groups?.comment;
                if (parsedComment) {
                    question.comment = Parser.rmNewlines(parsedComment);
                }

                const parsedSource = result?.groups?.source;
                if (parsedSource) {
                    question.source = Parser.rmNewlines(parsedSource);
                }

                const lastTheme = packet.rounds[0].themes.at(-1);
                if (lastTheme === undefined) {
                    throw new Error("error: question created without existing theme. question text: " + fullQuestion);
                }
                lastTheme.questions.push(question);
            }
            else { /// processing theme
                const result = themeRegex.exec(text)!;

                const theme = new Theme();

                const fullQuestion = result[0];

                const parsedName = result?.groups?.name;
                if (parsedName === undefined) {
                    throw new Error("error: parsing question price failed. question text: " + fullQuestion);
                }
                theme.name = Parser.rmNewlines(parsedName);

                const parsedComment = result?.groups?.comment;
                if (parsedComment) {
                    theme.comment = Parser.rmNewlines(parsedComment);
                }

                packet.rounds[0].themes.push(theme);
            }

            lastIndex = Math.max(themeRegex.lastIndex, questionRegex.lastIndex);
            themeRegex.lastIndex = lastIndex;
            questionRegex.lastIndex = lastIndex;
        }

        return packet;
    }
}