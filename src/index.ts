import { Packet } from "./packet.entity";
import { Question } from "./question.entity";
import { Theme } from "./theme.entity";

const specialThemeWords: string[] = [
    "$_Тема_$",
    "$_Комментарий_$",
    "$_Мусор_$"
];

const specialQuestionWords: string[] = [
    "$_Номинал_$",
    "$_Вопрос_$",
    "$_Ответ_$",
    "$_Зачет_$",
    "$_Комментарий_$",
    "$_Источник_$",
    "$_Мусор_$"
];

function getLastElement<Type>(array: Array<Type>): Type {
    return array[array.length - 1];
}

const functionsForSTW: Function[] = [
    function theme(packet: Packet, value: string) {
        packet.rounds[0].themes.push(new Theme(value));
    },
    function comment(packet: Packet, value: string) {
        getLastElement(packet.rounds[0].themes).comment = value;
    },
    function trash() { }
];

const functionsForSQW: Function[] = [
    function nominal(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        questions.push(new Question(Number(value)));
    },
    function problem(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        const lastQuestion = getLastElement(questions);
        lastQuestion.problem = value;
    },
    function answer(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        const lastQuestion = getLastElement(questions);
        lastQuestion.answer.push(value);
    },
    function acceptable(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        const lastQuestion = getLastElement(questions);
        lastQuestion.answer.push(value);
    },
    function comment(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        const lastQuestion = getLastElement(questions);
        lastQuestion.comment = value;
    },
    function source(packet: Packet, value: string) {
        const questions = getLastElement(packet.rounds[0].themes).questions;
        const lastQuestion = getLastElement(questions);
        lastQuestion.source = value;
    },
    function trash() { }
];
function divideTemplate(template: string): string[] {
    const tokens: string[] = [];
    while (template.length > 0) {
        const firstSWIndex = template.search("$_");
        if (firstSWIndex === -1) {
            tokens.push(template);
            template = "";
            continue;
        }
        tokens.push(template.slice(0, firstSWIndex));
        template = template.slice(firstSWIndex);
        const firstAfterSWIndex = template.search("_$") + 2;
        if (template.search("_$") === -1) {
            throw new Error("error: speacial word not closed");
        }
        tokens.push(template.slice(0, firstAfterSWIndex));
        template = template.slice(firstAfterSWIndex);
    }
    return tokens;
}

function isSpecialWord(word: string) {
    return word.slice(0, 2) === '$_' && word.slice(-2) === '_$';
}

function isSeparator(word: string) {
    return word.slice(0, 2) !== '$_' || word.slice(-2) !== '_$';
}

export function textToObject(text: string, templateTheme: string, templateQuestion: string) {
    const packet = new Packet();

    const brokenThemeTemp: string[] = divideTemplate(templateTheme);
    const brokenQuestionTemp: string[] = divideTemplate(templateQuestion);

    const firstThemeSeparator: string = isSeparator(brokenThemeTemp[0]) ? brokenThemeTemp[0] : brokenThemeTemp[1];
    const firstQuestionSeparator: string = isSeparator(brokenQuestionTemp[0]) ? brokenQuestionTemp[0] : brokenQuestionTemp[1];

    while (text.length > 0) {
        let themeSeparatorIndex: number = text.indexOf(firstThemeSeparator);
        let questionSeparatorIndex: number = text.indexOf(firstQuestionSeparator);

        if (themeSeparatorIndex === -1) {
            themeSeparatorIndex = Infinity;
        }

        if (questionSeparatorIndex === -1) {
            questionSeparatorIndex = Infinity;
        }

        if (themeSeparatorIndex === Infinity && questionSeparatorIndex === Infinity) {
            throw new Error("error: separators not found");
        }

        if (themeSeparatorIndex < questionSeparatorIndex) {
            for (let i = 0; i < brokenThemeTemp.length; i++) {
                const word: string = brokenThemeTemp[i];
                if (isSpecialWord(word)) {
                    const nextWord = brokenThemeTemp[i + 1];
                    const nextInText = text.indexOf(nextWord);
                    const wordInText = text.slice(0, nextInText);
                    functionsForSTW[specialThemeWords.indexOf(word)](packet, wordInText);
                    text = text.slice(nextInText);
                }
                else if (isSeparator(word)) {
                    const indexInText = text.indexOf(word);
                    text = text.slice(indexInText, indexInText + word.length);
                }
            }
        }
        else if (themeSeparatorIndex > questionSeparatorIndex) {
            for (let i = 0; i < brokenQuestionTemp.length; i++) {
                const word: string = brokenQuestionTemp[i];
                if (isSpecialWord(word)) {
                    const nextWord = brokenQuestionTemp[i + 1];
                    const nextInText = text.indexOf(nextWord);
                    const wordInText = text.slice(0, nextInText);
                    functionsForSQW[specialQuestionWords.indexOf(word)](packet, wordInText);
                    text = text.slice(nextInText);
                }
                else if (isSeparator(word)) {
                    const indexInText = text.indexOf(word);
                    text = text.slice(indexInText, indexInText + word.length);
                }
            }
        }
    }
    return packet;
}