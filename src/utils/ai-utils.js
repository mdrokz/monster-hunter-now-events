import { HfInference } from "@huggingface/inference";
// import { experimental_buildLlama2Prompt } from 'ai/prompts';

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

export async function askHuggingFace(messages, debug) {
    const Hf = new HfInference("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");

    const inputText = messages.filter(({ role }) => role != "system").map(({ content }) => content).join('\n');

    console.log(inputText);

    const predictions = await Hf.tokenClassification({
        model: "dbmdz/bert-large-cased-finetuned-conll03-english",
        inputs: inputText
    });

    const lines = inputText.trim().split('\n');
    const summary = lines[0];
    const description = lines.slice(1, 4).join(' ').trim();

    const monsters = [... new Set(predictions.filter(pred => pred.entity_group === "MISC" && pred.score > 0.8).map(pred => pred.word))];
    const habitats = [... new Set(predictions.filter(pred => pred.entity_group === "LOC" && pred.word.includes("Habitats")).map(pred => pred.word))];

    // Hf.textGeneration({
    //     model: "EleutherAI/gpt-neo-2.7B",
    //     inputs: experimental_buildLlama2Prompt(messages)
    // })

    // console.log(predictions);
    // Extract habitats using rule-based matching
    // const habitats = inputText.includes("Forest Habitats") ? ["Forest"] : [];

    // Extract date and time intervals using regex
    const datePattern = /(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}, \d{4}/g;
    const timePattern = /\d{1,2}:\d{2} (a.m.|p.m.)/g;
    const dates = inputText.match(datePattern) || [];
    const times = inputText.match(timePattern) || [];

    // console.log(dates);
    // console.log(times);

    const eventDates = [];

    for (const [index, date] of dates.entries()) {
        const startTime = times[2 * index] ? convertTo24Hour(times[2 * index]) : null;
        const endTime = times[2 * index + 1] ? convertTo24Hour(times[2 * index + 1]) : null;

        const allDay = !startTime || !endTime;

        const startDate = startTime ? new Date(`${date} ${startTime}`) : new Date(date);
        const endDate = endTime ? new Date(`${date} ${endTime}`) : new Date(date);

        // If it's an all-day event, adjust the end time to the end of the day
        if (allDay) {
            endDate.setHours(23, 59, 59, 999);
        }

        eventDates.push({
            start: startDate,
            end: endDate,
            allDay: allDay
        });
    }

    // Construct the JSON
    const eventJson = {
        events: [{
            summary: summary,
            description: description,
            dates: eventDates,  // You'll need to pair up the extracted dates and times and format them as required
            habitat: habitats,
            monsters: monsters
        }]
    };

    console.log(JSON.stringify(eventJson, null, 2));

    return eventJson
}