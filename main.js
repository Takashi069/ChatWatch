const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Create a new client instance
const client = new Client();

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('ChatWatch is online!');
});

// Scan QR to connect
client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
// Start your client
client.initialize();

//List of trigger words: 
const triggerWords = [
    
];
//Pre-Load the sticker 
const sticker = MessageMedia.fromFilePath('./<image_path>');

//this means it handles any version of letetrs like: é 
const removeDiacritics = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

function normalizeText(text) {
    return removeDiacritics(
        text
            .toLowerCase()
            .replace(/[^a-z\s]/gi, '')           // Keep only letters and spaces
            .replace(/([a-z])\1{2,}/g, '$1')     // Collapse only 3+ repeated letters
            .replace(/\s+/g, ' ')                // Normalize multiple spaces to a single space
            .trim()
    );
}


// Listening to all incoming messages and respond back if the message body says "Akash say hi"
client.on('message_create', async message => {    
    try{
        // console.log(message)

        //ignore all messages that is not in the group 'cloud gang'
        const chat = await message.getChat();
        // console.log(chat)
        if (!chat.isGroup || chat.name.toLowerCase() !== '<group name>'){
            console.log("Not <group name>")
            return
        }
            

        //Now comes the logic

        //get the message: 
        const msgText = normalizeText(message.body);
        //iterate through the trigger words and check if the message has it or not
        for (const word of triggerWords) {
            if (msgText.includes(word)) {
                //Identify who triggered the bot
                const contact = await message.getContact();
                const name = contact.pushname || contact.name || contact.number;
                const contactID = contact.id._serialized
                console.log(`Bot triggered by: ${name}`);
                //Matching the word
                console.log(`Matched word: ${word} in group: ${chat.name}`);
                const stickerMsg = await chat.sendMessage(sticker, { 
                                    sendMediaAsSticker: true,  
                                });
                                
                await chat.sendMessage(`@${contact.number}`,{
                    quotedMessageId: stickerMsg.id._serialized,
                    mentions: [contactID]
                })
                break; // Only send one sticker per message
            }
        }
    }catch(err){
        console.error("Error: ",err)
    }
    
});
