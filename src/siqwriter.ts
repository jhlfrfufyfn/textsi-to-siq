import { Packet } from "./packet.entity";
import * as fsPromise from 'fs/promises';
import * as fs from 'fs';
import * as xmljs from 'xml-js';
import JSZip from "jszip";

export class SiqWriter {
    static async packetToXml(packet: Packet) {
        const packetXmlText = (await fsPromise.readFile(__dirname + '/../data/packet.xml')).toString();
        const packetTemplate = JSON.parse(xmljs.xml2json(packetXmlText, { compact: true, trim: true }));

        const themeXmlText = (await fsPromise.readFile(__dirname + '/../data/theme.xml')).toString();
        const themeTemplate = JSON.parse(xmljs.xml2json(themeXmlText, { compact: true, trim: true }));

        const questionXmlText = (await fsPromise.readFile(__dirname + '/../data/question.xml')).toString();
        const questionTemplate = JSON.parse(xmljs.xml2json(questionXmlText, { compact: true, trim: true }));

        packetTemplate.package.rounds.round = [];
        for (const round of packet.rounds) {
            const currentRoundObject = { _attributes: { name: round.name }, themes: { theme: [] as any[] } };
            for (const theme of round.themes) {
                const themeObject = structuredClone(themeTemplate);
                const currentTheme = themeObject.theme;
                currentTheme.questions.question = [];

                currentTheme._attributes.name = theme.name;
                for (const question of theme.questions) {
                    const questionObject = structuredClone(questionTemplate);
                    const currentQuestion = questionObject.question;
                    currentQuestion._attributes.price = question.price;
                    currentQuestion.info.sources.source = question.source;
                    currentQuestion.scenario.atom = question.problem;
                    currentQuestion.right.answer = question.answer;
                    currentQuestion.info.comments = question.comment;

                    themeObject.theme.questions.question.push(questionObject.question);
                }

                currentRoundObject.themes.theme.push(themeObject.theme);
            }
            packetTemplate.package.rounds.round.push(currentRoundObject);
        }

        const generatedXml = xmljs.js2xml(packetTemplate, { spaces: '\t', compact: true, fullTagEmptyElement: true });

        return generatedXml;
    }

    static async xmlToSiq(generatedXml: string) {
        const siqZip = new JSZip();

        siqZip.file("content.xml", generatedXml);
        siqZip.folder("Images");
        siqZip.folder("Texts");
        siqZip.folder("Audio");

        const stream = siqZip.generateNodeStream({ type: 'nodebuffer', streamFiles: true });
        return stream;
    }
}