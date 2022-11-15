import * as fs from 'fs';
import * as fsPromise from 'fs/promises'
import { Parser } from '../src/parser';
import { SiqWriter } from '../src/siqwriter';

async function test() {
    const text = (await fsPromise.readFile(process.cwd() + '/data/packet.txt')).toString();

    const regexStr = "(?<price>\\d+)\\.(?<problem>.*?)\\nОтвет: (?<answer>.*?)\\n";
    const acceptableRegexStr = "(?:Зач.т: (?<accept>.*?)\\n)?";
    const commentRegexStr = "(?:Комментарий: (?<comment>.*?)\\n)?";
    const sourceRegexStr = "(?:Источник: (?<source>.*?)\\n)?";
    const questionRegexStr = regexStr + acceptableRegexStr + commentRegexStr + sourceRegexStr;
    
    const themeRegexStr = "Тема\\s\\d+[^а-яА-Яa-zA-Z\\d]*(?<name>.*?)\\n"
    const re = new RegExp(themeRegexStr, 'sig');

    const packet = Parser.textToPacket(text, questionRegexStr, themeRegexStr);

    const genXml = await SiqWriter.packetToXml(packet);
    (await SiqWriter.xmlToSiq(genXml)).pipe(fs.createWriteStream('sigame.siq'));
}

test();