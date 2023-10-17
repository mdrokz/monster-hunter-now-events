import { HuggingFaceStream, StreamingTextResponse } from 'ai';
import { HfInference } from "@huggingface/inference";
import { experimental_buildLlama2Prompt } from 'ai/prompts';
import { client } from "@gradio/client";

const a = [
    {
        role: 'system',
        content: '**Event Extraction Guidelines: Monster Hunter Now**\n' +
            '\n' +
            'Extract strictly in-game events occurring within the virtual game "Monster Hunter Now". Ensure your extraction adheres to the following criteria:\n' +
            '\n' +
            '1. **Game Environment**:\n' +
            '- Events MUST ONLY occur inside the "Monster Hunter Now" game environment. Do NOT include any external promotions (like pre-registration rewards), updates, or non-game events.\n' +
            '\n' +
            '2. **Event Duration**:\n' +
            '- Every event should have both a start and end time.\n' +
            '- For all-day events without specific times, set "allDay": true with 00:00:00 as the start and 23:59:59 as the end.\n' +
            '\n' +
            '3. **Event Continuity**:\n' +
            '- Combine multiple instances of the same event found in different content into one, capturing all details.\n' +
            '- Separate additional intervals or time frames within the event details.\n' +
            '\n' +
            '4. **Avoid Assumptions/Additions**:\n' +
            '- Extract only based on the provided content. Do NOT incorporate outside information.\n' +
            '\n' +
            '**Focus On**:\n' +
            '- Player-centric quests, missions, and challenges that are time-bound.\n' +
            '- In-game bonuses, competitions with clear start/end times.\n' +
            '- Game locations linked with events.\n' +
            '\n' +
            '**Exclude**:\n' +
            '- Any events or promotions that are not part of the direct in-game experience. This includes pre-registration rewards, generic game updates, or features without a specific in-game activity timeframe.\n' +
            '- Ambiguous events without a clear time-bound in-game context.\n' +
            '\n' +
            'When listing dates, organize them from recent to oldest. Ensure consecutive dates follow consecutively.\n' +
            '\n' +
            'If no in-game event fits the criteria, return an empty events array.\n' +
            '\n' +
            'Ensure the output is valid JSON. extract data from the news & fill it in output JSON\n' +
            '\n' +
            '**Output Format**:\n' +
            '{\n' +
            '    events: [{\n' +
            '        "summary": "Event Name",\n' +
            '        "description": "Event Details",\n' +
            '        "dates": [\n' +
            '            {\n' +
            '                "start": "YYYY-MM-DDTHH:mm:ss",\n' +
            '                "end": "YYYY-MM-DDTHH:mm:ss",\n' +
            '                "allDay": true/false\n' +
            '            }\n' +
            '        ],\n' +
            '        "habitat": ["Desert", "Forest", "Swamp", etc],\n' +
            '        "monsters": ["Rathalos", "Rathian", "Diablos", etc],\n' +
            '    }],\n' +
            '}'
    },
    {
        role: 'user',
        content: 'Identify in-game events from the following content:'
    },
    {
        role: 'user',
        content: 'News\n' +
            'A cherry-colored season: Investigate a new subspecies!\n' +
            'Cherry-colored Rathian scales, different from those of a normal Rathian, have been discovered in Forest Habitats! These traces seem to indicate some kind of change in the ecosystem.\n' +
            'It seems that the Queen of the Land and her cherry-colored counterpart will soon descend upon us…\n' +
            'Hunters, make your preparations and head out to Forest Habitats to investigate!\n' +
            'Dates & Times (local time):\n' +
            'Pink Rathian will appear during the following times:\n' +
            'Monday, October 9, 2023, 9:00 a.m. to Sunday, October 15, 2023, 4:00 p.m.\n' +
            'Rathian and Pink Rathian will appear more frequently during the following times:\n' +
            'Friday, October 13, 2023, from 5:00 p.m. to 8:00 p.m.\n' +
            'Saturday, October 14, 2023, from 1:00 p.m. to 4:00 p.m.\n' +
            'Sunday, October 15, 2023, from 1:00 p.m. to 4:00 p.m.\n' +
            'Event Details:\n' +
            'From Monday, October 9, at 9:00 a.m. until Sunday, October 15, at 4:00 p.m., Pink Rathian will appear in low numbers in Forest Habitats.\n' +
            'Pink Rathian will appear as long as you have unlocked Rathian hunts (by completing Chapter 9).\n' +
            'While appearance rates are boosted between Friday, October 13, and Sunday, October 15, in Forest Habitats, Rathian will appear more frequently than usual and Pink Rathian will also be easier to find.\n' +
            'Additional Information\n' +
            'While appearance rates are boosted between Friday, October 13, and Sunday, October 15, Rathian and Pink Rathian will appear in Forest Habitats for all hunters HR11 and above.\n' +
            'Event details are subject to change.\n' +
            'Be sure to follow us on social media for all the latest news!'
    }
];





export async function askHuggingFace(messages, debug) {
    const Hf = new HfInference("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");


    // map messages to assistant human format

    // let t = messages.map(({ content, role }) => {
    //     if (role === "user") {
    //         return `<|prompter|>${content}\n`
    //     } else {
    //         return `<|assistant|>${content}\n`
    //     }
    // }).join("\n");

    // console.log(t);

    try {
        // const response = await Hf.textGenerationStream({
        //     model: 'google/flan-t5-xxl',
        //     inputs: experimental_buildLlama2Prompt(messages),
        //     parameters: {
        //         max_new_tokens: 200,
        //         // @ts-ignore (this is a valid parameter specifically in OpenAssistant models)
        //         typical_p: 0.2,
        //         repetition_penalty: 1,
        //         truncate: 1000,
        //         return_full_text: false,
        //     },
        // });
        console.log(experimental_buildLlama2Prompt(messages));
        

        const text = await Hf.textGeneration({
            model: "EleutherAI/gpt-neo-2.7B",
            inputs: experimental_buildLlama2Prompt(messages)
        })


        // const stream = HuggingFaceStream(response);

        // const r = new StreamingTextResponse(stream);

        // const text = await r.text();
        console.log(text);
    } catch (e) {
        console.log(e);
    }



    // console.log(response.generated_text);
}

askHuggingFace(a,true);

async function inference() {
    try {
        const app = await client("https://huggingface-projects-llama-2-7b-chat.hf.space/--replicas/gs2z2/", {
            hf_token: "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",
            status_callback: (space_status) => console.log(space_status)
        });
        const result = await app.submit("/chat", [
            "what is science ?", // string  in 'Message' Textbox component		
            // "Howdy!", // string  in 'System prompt' Textbox component		
            1, // number (numeric value between 1 and 2048) in 'Max new tokens' Slider component		
            0.1, // number (numeric value between 0.1 and 4.0) in 'Temperature' Slider component		
            0.05, // number (numeric value between 0.05 and 1.0) in 'Top-p (nucleus sampling)' Slider component		
            1, // number (numeric value between 1 and 1000) in 'Top-k' Slider component		
            1, // number (numeric value between 1.0 and 2.0) in 'Repetition penalty' Slider component
        ]);

        result.on("data", (output) => {
            console.log(output);
        });

        result.on("log", (log) => {
            console.log(log);
        })

        result.on("status", (status) => {
            console.log(status);
        });

        result.on("end", () => {
            console.log("done");
        });

    } catch (e) {
        console.log("ROR", e);
    }
}

// inference();

// aggregate all text from a 

// const text = a.map(({ content }) => content).join('\n');

// console.log(text);

// const { Inference } = require('@huggingface/inference');

// Initialize the API client
const Hf = new HfInference("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");

const inputText = `
A cherry-colored season: Investigate a new subspecies!
Cherry-colored Rathian scales, different from those of a normal Rathian, have been discovered in Forest Habitats! These traces seem to indicate some kind of change in the ecosystem.
It seems that the Queen of the Land and her cherry-colored counterpart will soon descend upon us…
Hunters, make your preparations and head out to Forest Habitats to investigate!
Dates & Times (local time):
Pink Rathian will appear during the following times:
Monday, October 9, 2023, 9:00 a.m. to Sunday, October 15, 2023, 4:00 p.m.
Rathian and Pink Rathian will appear more frequently during the following times:
Friday, October 13, 2023, from 5:00 p.m. to 8:00 p.m.
Saturday, October 14, 2023, from 1:00 p.m. to 4:00 p.m.
Sunday, October 15, 2023, from 1:00 p.m. to 4:00 p.m.
Event Details:
From Monday, October 9, at 9:00 a.m. until Sunday, October 15, at 4:00 p.m., Pink Rathian will appear in low numbers in Forest Habitats.
Pink Rathian will appear as long as you have unlocked Rathian hunts (by completing Chapter 9).
While appearance rates are boosted between Friday, October 13, and Sunday, October 15, in Forest Habitats, Rathian will appear more frequently than usual and Pink Rathian will also be easier to find.
Additional Information
While appearance rates are boosted between Friday, October 13, and Sunday, October 15, Rathian and Pink Rathian will appear in Forest Habitats for all hunters HR11 and above.
`;

function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (hours === '12') {
        hours = '00';
    }

    if (modifier.toLowerCase() === 'pm') {
        hours = parseInt(hours, 10) + 12;
    }

    return `${hours}:${minutes}`;
}

// Hf.tokenClassification({
//     model: "dbmdz/bert-large-cased-finetuned-conll03-english",
//     inputs: inputText
// }).then(predictions => {
//     const lines = inputText.trim().split('\n');
//     const summary = lines[0];
//     const description = lines.slice(1, 4).join(' ').trim();

//     const monsters = [... new Set(predictions.filter(pred => pred.entity_group === "MISC" && pred.score > 0.7).map(pred => pred.word))];
//     const habitats = predictions.filter(pred => pred.entity_group === "LOC" && pred.word.includes("Habitats")).map(pred => pred.word);

//     // console.log(predictions);
//     // Extract habitats using rule-based matching
//     // const habitats = inputText.includes("Forest Habitats") ? ["Forest"] : [];

//     // Extract date and time intervals using regex
//     const datePattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/g;
//     const timePattern = /\d{1,2}:\d{2} (a.m.|p.m.)/g;
//     const dates = inputText.match(datePattern) || [];
//     const times = inputText.match(timePattern) || [];

//     console.log(dates);
//     console.log(times);

//     const eventDates = [];

//     for (const [index, date] of dates.entries()) {
//         const startTime = times[2 * index] ? convertTo24Hour(times[2 * index]) : null;
//         const endTime = times[2 * index + 1] ? convertTo24Hour(times[2 * index + 1]) : null;
    
//         const allDay = !startTime || !endTime;
    
//         const startDate = startTime ? new Date(`${date} ${startTime}`) : new Date(date);
//         const endDate = endTime ? new Date(`${date} ${endTime}`) : new Date(date);
    
//         // If it's an all-day event, adjust the end time to the end of the day
//         if (allDay) {
//             endDate.setHours(23, 59, 59, 999);
//         }
    
//         eventDates.push({
//             start: startDate,
//             end: endDate,
//             allDay: allDay
//         });
//     }

//         // Construct the JSON
//         const eventJson = {
//             events: [{
//                 summary: summary,
//                 description: description,
//                 dates: eventDates,  // You'll need to pair up the extracted dates and times and format them as required
//                 habitat: habitats,
//                 monsters: monsters
//             }]
//         };

//     console.log(JSON.stringify(eventJson, null, 2));
// })
