import * as fs from 'fs';
import * as fsPromise from 'fs/promises'
import { Parser } from '../src/parser';
import { SiqReader } from '../src/siqreader';


async function testXmlToPacket() {
    const xml = (await fsPromise.readFile(process.cwd() + '/test/generated.xml')).toString();

    const packet = await SiqReader.XmlToPacket(xml);
    (await fsPromise.writeFile(process.cwd() + '/test/packetGeneratedFromXml.txt', JSON.stringify(packet, null, 4)));
}

async function testSiqToPacket() {
    const siq = await fsPromise.readFile(process.cwd() + '/test/sigame.siq');
    const packet = await SiqReader.SiqToXml(siq);
    if (packet) {
        await fsPromise.writeFile(process.cwd() + '/test/generated2.xml', packet);
    }
    else {
        console.log('Error');
    }
}

testSiqToPacket();