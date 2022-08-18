import { Packet } from "./packet.entity";
import * as fs from 'fs/promises';
import * as xmljs from 'xml-js';

export class SiqWriter {
    static async packetToXml(packet: Packet) {
        const initialXmlText = (await fs.readFile(__dirname + '/../data/initial.xml')).toString();
        const initialObject = JSON.parse(xmljs.xml2json(initialXmlText, { compact: true }));

        const themeXmlText = (await fs.readFile(__dirname + '/../data/theme.xml')).toString();
        const themeObject = JSON.parse(xmljs.xml2json(themeXmlText, { compact: true }));

        const questionXmlText = (await fs.readFile(__dirname + '/../data/question.xml')).toString();
        const questionObject = JSON.parse(xmljs.xml2json(questionXmlText, { compact: true }));

        console.log(initialObject.package);
        console.log(themeObject);
        console.log(questionObject);
        
        initialObject.package.rounds.round = [];
        for (const round of packet.rounds) {
            const currentRoundObject = { _attributes: { name: round.name }, themes: { theme: [] as any[] } };
            for (const theme of round.themes) {
                const currentThemeObject = Object.assign({}, themeObject);
                currentThemeObject.theme.questions.question = [];

                currentThemeObject.theme._attributes.name = theme.name;

                for (const question of theme.questions) {
                    const currentQuestionObject = Object.assign({}, questionObject);

                    currentQuestionObject.question._attributes.price = question.price;
                    currentQuestionObject.question.info.sources.source = question.source;
                    currentQuestionObject.question.scenario.atom = question.problem;
                    currentQuestionObject.question.right.answer = question.answer;
                    currentQuestionObject.question.info.comments = question.comment;

                    currentThemeObject.theme.questions.question.push(currentQuestionObject);
                }

                currentRoundObject.themes.theme.push(currentThemeObject);
            }
            initialObject.package.rounds.round.push(round);
        }
        const generatedXml = xmljs.js2xml(initialObject, { spaces: '\t', compact: true});
        console.log(initialObject);
        await fs.writeFile(__dirname + '/../data/generated.xml', generatedXml);
    }
}